import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import {AgGridNg2} from 'ag-grid-angular';

// Other Components
import { HeaderComponent } from '../../../../components/header/header.component';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { EppService } from '../../../../generated/api/epp.service';
import { GlobalsService } from '../../../../services/globals.service';
import { User } from '../../../../generated';

declare const $: any;

@Component({
  selector: 'pr-table',
  templateUrl: './pr-table.component.html',
  styleUrls: ['./pr-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrTableComponent implements OnInit {

  form: FormGroup;
  loading: boolean = false;
  fileName: string;
  responseError: string;
  data = [];
  currentPage: number;
  totalPages: number;
  communityId:string;

  @ViewChild(HeaderComponent) header;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  constructor(private fb: FormBuilder,
              private eppService: EppService,
              private globalsSvc:GlobalsService) {
    this.createForm();
  }


  ngOnInit() {
    this.globalsSvc.user().subscribe( user => {
      this.communityId=user.currentCommunityId;
      // this.eppService.getByCommunityId(this.communityId).subscribe(response => {
      //   if (!response.error) {
      //     this.data = response.result;
      //     this.generateFiscalYearColumns(this.data);
      //   } else {
      //     alert(response.error);
      //   }
      // });
    });
  }


  clearFile() {
    this.fileName = '';
    this.responseError = '';
    this.fileInput.nativeElement.value = '';
    this.form.get('epp-input-file').setValue(null);
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

  private prepareSave(): any {
    let input = new FormData();
    input.append('name', this.fileName);
    input.append('file', this.form.get('epp-input-file').value);
    return input;
  }

  private createForm() {
    this.form = this.fb.group({
      'epp-input-file': ['', Validators.required]
    });
  }

  currencyCellRenderer(value) {
    if(isNaN(value)) {
      value = 0;
    }
    var usdFormate = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
    return usdFormate.format(value);
  }

  generateFundingLine(params){
    let result = params.data.appropriation !== null? params.data.appropriation : '';
    result = result.concat(params.data.blin !== null? ('/').concat(params.data.blin) : '');
    result = result.concat(params.data.item !== null? ('/').concat(params.data.item) : '');
    result = result.concat(params.data.opAgency !== null? ('/').concat(params.data.opAgency): '');
    return result;
  }

  getFiscalYear(params, year) {
    return this.currencyCellRenderer(params.data.fySums[year]);
  }

  generateFiscalYearColumns(eppList) {
    if (eppList && eppList.length > 0) {
      let columnKeys = [];
      eppList.forEach(epp => {
        Object.keys(epp.fySums).forEach(year => {
          columnKeys.push(year);
          })
      });
      columnKeys.sort();
      Array.from(new Set(columnKeys)).forEach(key => {
        let columnKey = key.replace('20', 'FY')
        let colDef = {
          headerName: columnKey,
          maxWidth: 92,
          type: "numericColumn",
          valueGetter: params => {return this.getFiscalYear(params, key)}
        };
        // if(!this.exist(this.columnDefs, colDef)) {
        //   this.columnDefs.push(colDef);
        // }
      });
      this.agGrid.api.setColumnDefs(this.columnDefs);
      this.agGrid.api.sizeColumnsToFit();
    }
  }


  columnDefs = [
    {
      headerName: 'Program',
      field: 'shortName',
      width: 160,
      sort: "asc",
      rowSpan: function(params) {
          var shortName = params.data.shortName;
          if (shortName === "Program") {
            return 2;
          } else if (shortName === "Sub Program") {
            return 2;
          }
        },
      cellStyle: { backgroundColor: "#CCCCCC" }
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 130,
      sort: "asc",
      rowSpan: function(params) {
          var status = params.data.status;
          if (status === "Outstanding") {
            return 2;
          } else if (status === "Saved") {
            return 2;
          } else if (status === "Submitted") {
            return 2;
          }
        },
      cellStyle: { backgroundColor: "#CCCCCC" }
    },
    {
      headerName: 'Date',
      field: "date",
      width: 110,
      sort: "asc",
      rowSpan: function(params) {
          var date = params.data.date;
          if (date === "2012") {
            return 2;
          }
        },
      cellStyle: { backgroundColor: "#CCCCCC" }
    },
    {
      headerName: 'Cycle',
      field: "cycle",
      width: 92,
      cellStyle: { backgroundColor: "#FFFFFF" }
    },
    {
      headerName: 'FY15',
      field: "FY15",
      width: 92,
      cellStyle: { backgroundColor: "#FFFFFF" }
    },
    {
      headerName: 'FY16',
      field: "FY16",
      width: 92,
      cellStyle: { backgroundColor: "#FFFFFF" }
    },
    {
      headerName: 'FY17',
      field: "FY17",
      width: 92,
      cellStyle: { backgroundColor: "#FFFFFF" }
    },
    {
      headerName: 'FY18',
      field: "FY18",
      width: 92
    },
    {
      headerName: 'FY19',
      field: "FY19",
      width: 92
    },
    {
      headerName: 'FY20',
      field: "FY20",
      width: 92
    },
    {
      headerName: 'FY21',
      field: "FY21",
      width: 92
    },
    {
      headerName: 'Total',
      field: "total",
      width: 90
    }
  ]

  rowData =  [

    {
      shortName: 'Sub Program',
      status: 'Submitted',
      date: '2013'
    },
    {
      shortName: 'Program',
      status: 'Saved',
      date: '2014'
    },
    {
      shortName: 'Sub Program',
      status: 'Submitted',
      date: '2015'
    },
    {
      shortName: 'Program',
      status: 'Outstanding',
      date: '2012'
    },
    {
      shortName: 'Sub Program',
      status: 'Submitted',
      date: '2013'
    },
    {
      shortName: 'Sub Program',
      status: 'Outstanding',
      date: '2014'
    },
    {
      shortName: 'Program',
      status: 'Outstanding',
      date: '2015'
    },
    {
      shortName: 'Sub Program',
      status: 'Submitted',
      date: '2012'
    },
    {
      shortName: 'Program',
      status: 'Outstanding',
      date: '2013'
    },
    {
      shortName: 'Sub Program',
      status: 'Outstanding',
      date: '2014'
    },
    {
      shortName: 'Program',
      status: 'Submitted',
      date: '2015'
    }
  ]
}
