import { ProgramRequestWithFullName } from '../../../../services/with-full-name.service';
import { UiProgrammaticRequest } from '../UiProgrammaticRequest';
import { Component, Input, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { Pom } from '../../../../generated/model/pom';
import { GridOptions } from 'ag-grid';
import {AgGridNg2} from "ag-grid-angular";

@Component({
  selector: 'j-pom',
  templateUrl: './pom.component.html',
  styleUrls: ['./pom.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PomComponent implements OnChanges {

  @Input() private pomProgrammaticRequests: ProgramRequestWithFullName[];
  @Input() private pbProgrammaticRequests: ProgramRequestWithFullName[];
  @Input() private pom: Pom;

  @ViewChild("agGrid") private agGrid: AgGridNg2;
  private rowsData: any[];
  private gridOptions:GridOptions;
  private colDefs;

  ngOnChanges() {

    if (this.pbProgrammaticRequests && this.pomProgrammaticRequests && this.pom) {
      this.initGrid( this.pom.fy ); 
      this.populateRowData();
    }
      
  }

  private initGrid(by: number) {

    this.gridOptions = {
      columnDefs: this.setAgGridColDefs(by),
      gridAutoHeight: true,
      suppressDragLeaveHidesColumns: true,
      suppressMovableColumns: true,
    }
  }

  populateRowData() {

    let rowdata:any[] = [];

    let by = this.pom.fy;
    let arow = new Object();
    let sum;

    arow["id"] = "Baseline"; 
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      arow[year] = this.aggregateToas(this.pbProgrammaticRequests, year);
      sum += arow[year];
    }
    arow["total"] = sum;
    rowdata.push( arow );

    arow = new Object();
    arow["id"] = "Allocated TOA"; 
    sum = 0;
    let allocatedToas: { [year: number]: number } = {};
    this.pom.communityToas.forEach((toa) => {
      allocatedToas[toa.year] = toa.amount;
      arow[toa.year] = toa.amount;
      sum += arow[toa.year];
    });
    arow["total"] = sum;
    rowdata.push( arow );

    arow= new Object();
    arow["id"] = "POM 18 Requests"; 
    sum = 0;
    let pomRequests: { [year: number]: number } = {};
          for (let year: number = by; year < by + 5; year++) {
      pomRequests[year] = this.aggregateToas(this.pomProgrammaticRequests, year);
      arow[year]  = this.aggregateToas(this.pomProgrammaticRequests, year);
      sum += arow[year];
    }
    arow["total"] = sum;
    rowdata.push( arow );

    arow= new Object();
    arow["id"] = "TOA Difference"; 
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      
      arow[year] = allocatedToas[year] - pomRequests[year];
      sum += arow[year];
    }
    arow["total"] = sum;
    rowdata.push( arow );

    this.rowsData = rowdata;

    setTimeout(() => {
      this.agGrid.api.sizeColumnsToFit()
    });

  }

  aggregateToas(prs: ProgramRequestWithFullName[], year: number): number {
    return prs.map(pr => new UiProgrammaticRequest(pr).getToa(year)).reduce((a, b) => a + b, 0);
  }

  private setAgGridColDefs(by: number): any {

    this.colDefs =
      [{
        headerName: "",
        suppressMenu: true,
        field: 'id',
        width: 92,
        editable: false,
      }];

    for (var i = 0; i < 5; i++) {
      this.colDefs.push(
        {
          headerName: "FY" + (by + i - 2000),
          suppressMenu: true,
          field: (by + i).toString(),
          width: 92,
          editable: false,
          valueFormatter: params => { return this.currencyFormatter(params) },
          cellClassRules: {
             'font-weight-bold': params => { return params.data.id == 'Allocated TOA'  } ,
             'font-red' : params => { return params.value < 0 }, 
           },
           cellStyle: {'text-align': 'right'},
        });
    }
    this.colDefs.push(
      {
        headerName: "Total",
        suppressMenu: true,
        field: 'total',
        width: 92,
        editable: false,
        valueFormatter: params => { return this.currencyFormatter(params) },
        cellClassRules: {
          'font-red' : params => { return params.value < 0 },
        },
        cellStyle: {'text-align': 'right'},
      });
  }

  private onGridReady(params) {
    params.api.sizeColumnsToFit();
    window.addEventListener("resize", function () {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  private negativeNumberRenderer(params) {

    if (params.value < 0) {
      return '<span style="color: red;">' + this.currencyFormatter(params) + '</span>';
    } else {
      return this.currencyFormatter(params);
    }
  }

  private currencyFormatter(value): string {
    if (isNaN(value.value)) {
      value.value = 0;
    }
    var usdFormate = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
    return usdFormate.format(value.value);
  }

}


