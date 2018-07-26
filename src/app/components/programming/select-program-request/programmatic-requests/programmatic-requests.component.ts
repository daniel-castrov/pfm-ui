import { ProgramRequestWithFullName } from './../../../../services/with-full-name.service';
import { Router } from '@angular/router';
import {Component, Input, OnChanges, Output, EventEmitter, ViewChild} from '@angular/core';
import { PRService } from '../../../../generated/api/pR.service';
import { ProgramRequestPageModeService } from '../../program-request/page-mode.service';
import {AgGridNg2} from "ag-grid-angular";
import {SummaryProgramCellRenderer} from "../../../renderers/event-column/summary-program-cell-renderer.component";

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
  @Output() deleted: EventEmitter<any> = new EventEmitter();

  // used only during PR deletion
  private idToDelete: string;
  private nameToDelete: string;

  @ViewChild("agGrid") private agGrid: AgGridNg2;
  data = [];
  currentPage: number;
  totalPages: number;
  context: any;
  columnDefs = [];

  frameworkComponents = {
    summaryProgramCellRenderer: SummaryProgramCellRenderer,
  };

  constructor( private prService: PRService,
               private router: Router,
               private programRequestPageMode: ProgramRequestPageModeService) {
    this.context = { componentParent: this };
  }

  ngOnChanges() {
    if(this.pomProgrammaticRequests && this.pbProgrammaticRequests) {
      let data = []
      this.pomProgrammaticRequests.forEach(pr => {
        pr.type = 'pom';
        data.push(pr);
      });
      this.pbProgrammaticRequests.forEach(pr => {
        pr.type = 'pb';
        data.push(pr);
      });
      this.data = data;
      console.log(this.data)
      this.defineColumns(this.data);
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

  defineColumns(programRequests){
    this.columnDefs = [
      {
        headerName: 'Program',
        field: 'fullname',
        sort: "asc",
        cellClass: ['ag-cell-light-grey','ag-clickable', 'row-span'],
        cellRenderer: 'summaryProgramCellRenderer',
        rowSpan: function(params) {
          if (params.data.type == 'pom') {
            return 2;
          } else {
            return 1;
          }
        }
      },
      {
        headerName: 'Status',
        valueGetter: params => this.getStatus(params),
        cellClass: params => this.getStatusClass(params),
        cellStyle: { backgroundColor: "#eae9e9" },
        cellRenderer: 'summaryProgramCellRenderer',
        width: 60,
        rowSpan: function(params) {
          if (params.data.type == 'pom') {
            return 2;
          } else {
            return 1;
          }
        }
      },
      {
        headerName: 'Cycle',
        width: 50,
        cellClass: ['ag-cell-white'],
        valueGetter: params => {
          if (params.data.type == 'pb') {
            return 'PB' + (this.pbFy - 2000);
          } else {
            return 'POM' + (this.pomFy - 2000);
          }
        }
      }
    ];
    let columnKeys= [];
    programRequests.forEach(pr => {
      pr.fundingLines.forEach(fundingLines => {
        Object.keys(fundingLines.funds).forEach(year => {
          columnKeys.push(year);
        })
      });
    });
    columnKeys.sort();
    columnKeys = Array.from(new Set(columnKeys));
    Array.from(columnKeys).forEach((year, index) => {
      let subHeader;
      let cellClass = [];
      switch(Number(year)) {
        case (this.pomFy + 4):
          subHeader = 'BY+4';
          break;
        case this.pomFy + 3:
          subHeader = 'BY+3';
          break;
        case this.pomFy + 2:
          subHeader = 'BY+2';
          break;
        case this.pomFy + 1:
          subHeader = 'BY+1';
          break;
        case this.pomFy:
          subHeader = 'BY';
          break;
        case this.pomFy - 1:
          subHeader = 'CY';
          cellClass = ['ag-cell-white'];
          break;
        case this.pomFy - 2:
          subHeader = 'PY';
          cellClass = ['ag-cell-white'];
          break;
        case this.pomFy -3:
          subHeader = 'PY-1';
          cellClass = ['ag-cell-white'];
          break;
      }
      if (subHeader) {
        let colDef = {
          headerName: subHeader,
          children: [{
            headerName: year,
            maxWidth: 92,
            cellClass: cellClass,
            type: "numericColumn",
            valueGetter: params => {return this.getToa(params.data, year)}
          }]
        };
        this.columnDefs.push(colDef);
      } else {
        columnKeys.splice(index, 1)
      }
    });

    let totalColDef = {
      headerName: 'Total',
      maxWidth: 92,
      type: "numericColumn",
      valueGetter: params => {return this.getTotal(params.data, columnKeys)}
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

  getStatus(params) {
    if(!params.data.bulkOrigin && params.data.state == 'SAVED') return 'DRAFT';
    return params.data.state;
  }

  getStatusClass(params) {
    if(params.data.state === 'OUTSTANDING') {
      return 'text-danger row-span';
    }
    return 'text-primary row-span';
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
