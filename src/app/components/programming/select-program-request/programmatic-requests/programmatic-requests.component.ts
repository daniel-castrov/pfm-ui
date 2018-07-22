import { UiProgrammaticRequest } from './../UiProgrammaticRequest';
import { ProgramRequestWithFullName } from './../../../../services/with-full-name.service';
import { Router } from '@angular/router';
import {Component, Input, OnChanges, Output, EventEmitter, ViewChild} from '@angular/core';
import { Row } from './Row';
import { PRService } from '../../../../generated/api/pR.service';
import { ProgramRequestPageModeService } from '../../program-request/page-mode.service';
import {AgGridNg2} from "ag-grid-angular";

@Component({
  selector: 'programmatic-requests',
  templateUrl: './programmatic-requests.component.html',
  styleUrls: ['./programmatic-requests.component.scss']
})
export class ProgrammaticRequestsComponent implements OnChanges {

  @Input() private pomProgrammaticRequests: ProgramRequestWithFullName[];
  @Input() private pbProgrammaticRequests: ProgramRequestWithFullName[];
  @Input() private pomFy: number;
  @Input() private pbFy: number;
  @Input() private reviewOnly: boolean;
  private mapNameToRow = {};
  @Output() deleted: EventEmitter<any> = new EventEmitter();

  // used only during PR deletion
  private idToDelete: string;
  private nameToDelete: string;

  @ViewChild("agGrid") private agGrid: AgGridNg2;
  data = [];
  currentPage: number;
  totalPages: number;

  columnDefs: any = [
    {
      headerName: 'Program',
      field: 'fullname',
      sort: "asc"
    },
    {
      headerName: 'Status',
      valueGetter: params => this.getStatus(params),
      cellClass: params => this.getStatusClass(params),
      width: 60
    },
    {
      headerName: 'Cycle',
      width: 50,
      valueGetter: params => {
        if (params.data.type == 'pb') {
          return 'PB' + (this.pbFy - 2000);
        } else {
          return 'POM' + (this.pomFy - 2000);
        }
      }
    }
  ];

  constructor( private prService: PRService,
               private router: Router,
               private programRequestPageMode: ProgramRequestPageModeService) {}

  ngOnChanges() {
    if(this.pomProgrammaticRequests && this.pbProgrammaticRequests) {
      this.mapNameToRow = this.createMapNameToRow();
    }
    setTimeout(() => {
      this.agGrid.api.sizeColumnsToFit()
    });
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
    window.addEventListener("resize", function() {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  private createMapNameToRow() {
    const result = {};
    let data = []
    this.pomProgrammaticRequests.forEach(pr => {
      result[pr.fullname] = new Row(pr);
      pr.type = 'pom';
      data.push(pr);
    });
    this.pbProgrammaticRequests.forEach(pr => {
      if (result[pr.fullname]) {
        result[pr.fullname].addPbPr(pr);
        pr.type = 'pb';
        data.push(pr);
      };
    });
    this.data = data;
    this.createFYColumns(this.data);
    return result;
  }

  createFYColumns(programRequests){
    let columnKeys = [];
    programRequests.forEach(pr => {
      pr.fundingLines.forEach(fundingLines => {
        Object.keys(fundingLines.funds).forEach(year => {
          columnKeys.push(year);
        })
      });
    });
    columnKeys.sort();
    Array.from(new Set(columnKeys)).forEach(year => {
      let colDef = {
        headerName: year,
        maxWidth: 92,
        type: "numericColumn",
        valueGetter: params => {return this.getToa(params.data, year)}
      };
      this.columnDefs.push(colDef);
    });

    let totalColDef = {
      headerName: 'Total',
      maxWidth: 92,
      type: "numericColumn",
      valueGetter: params => {return this.getTotal(params.data, new Set(columnKeys))}
    };
    this.columnDefs.push(totalColDef);
    this.agGrid.api.setColumnDefs(this.columnDefs);
  }

  getTotal(pr, columnKeys): number {
    let result = 0;
    columnKeys.forEach(year => {
      let amount = pr.fundingLines
        .map( fundingLine => fundingLine.funds[year] ? fundingLine.funds[year] : 0 )
        .reduce((a,b)=>a+b, 0);
      result += amount;
    });
    return result;
  }


  getToa(pr, year): number {
    let amount = pr.fundingLines
      .map( fundingLine => fundingLine.funds[year] ? fundingLine.funds[year] : 0 )
      .reduce((a,b)=>a+b, 0);
    return amount;
  }

  saveDeletionValues(id: string, shortName: string) {
    this.idToDelete = id;
    this.nameToDelete = shortName;
  }

  delete() {
    this.prService.remove(this.idToDelete).toPromise();
    this.deleted.emit();
  }

  editPR(prId: string) {
    this.programRequestPageMode.prId = prId;
    this.router.navigate(['/program-request']);
  }

  totalColumns(uiPr: UiProgrammaticRequest): number {
    if(!uiPr) return 0;
    let result: number = 0;
    for(let year: number = this.pomFy-3; year<this.pomFy+5; year++) {
      result += uiPr.getToa(year);
    }
    return result;
  }

  getStatus(params) {
    if(!params.data.bulkOrigin && params.data.state == 'SAVED') return 'DRAFT';
    return params.data.state;
  }

  getStatusClass(params) {
    if(params.data.state === 'OUTSTANDING') {
      return 'text-danger';
    }
    return '';
  }

  onBtFirst() {
    this.agGrid.api.paginationGoToFirstPage();
  }

  onBtLast() {
    this.agGrid.api.paginationGoToLastPage();
  }

  onBtNext() {
    this.agGrid.api.paginationGoToNextPage();
  }

  onBtPrevious() {
    this.agGrid.api.paginationGoToPreviousPage();
  }

  onPaginationChanged() {
    if (this.agGrid.api) {
      this.currentPage = this.agGrid.api.paginationGetCurrentPage() + 1;
      this.totalPages = this.agGrid.api.paginationGetTotalPages();
    }
  }

  onPageSizeChanged(event) {
    var selectedValue = Number(event.target.value);
    this.agGrid.api.paginationSetPageSize(selectedValue);
    this.agGrid.api.sizeColumnsToFit();
  }
}
