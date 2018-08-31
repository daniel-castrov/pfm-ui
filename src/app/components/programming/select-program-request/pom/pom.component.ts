import { Component, Input, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { AgGridNg2 } from "ag-grid-angular";
import { ProgramRequestWithFullName } from '../../../../services/with-full-name.service';
import { UiProgrammaticRequest } from '../UiProgrammaticRequest';
import { Pom } from '../../../../generated/model/pom';

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
  private colDefs;

  ngOnChanges() {

    if (this.pbProgrammaticRequests && this.pomProgrammaticRequests && this.pom) {
      this.initGrid( this.pom.fy ); 
      this.populateRowData();
      setTimeout(() => {
        this.agGrid.api.sizeColumnsToFit()
      });
    }
  }

  private initGrid(by: number) {

    this.agGrid.gridOptions = {
      columnDefs: this.setAgGridColDefs(by),
    }
  }

  private setAgGridColDefs(by: number): any {

    // First column - id
    this.colDefs =
      [{
        headerName: "",
        suppressMenu: true,
        field: 'id',
        width: 102,
        editable: false,
        cellClass: "font-weight-bold"
      }];

    // Columns for FYs
    for (var i = 0; i < 5; i++) {
      this.colDefs.push(
        {
          headerName: "FY" + (by + i - 2000),
          type: "numericColumn",
          suppressMenu: true,
          field: (by + i).toString(),
          width: 92,
          editable: false,
          valueFormatter: params => { return this.currencyFormatter(params) },
          cellClassRules: {
             'font-weight-bold': params => { return params.data.id == 'Allocated TOA'  } ,
             'font-red' : params => { return params.value < 0 }, 
           },
        });
    }

    // Last column - total
    this.colDefs.push(
      {
        headerName: "Total",
        type: "numericColumn",
        suppressMenu: true,
        field: 'total',
        width: 92,
        editable: false,
        valueFormatter: params => { return this.currencyFormatter(params) },
        cellClassRules: {
          'font-red' : params => { return params.value < 0 },
        },
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

  private populateRowData() {

    let rowdata:any[] = [];
    let by = this.pom.fy;
    let row = new Object();
    let sum;

    row["id"] = "Baseline"; 
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      row[year] = this.aggregateToas(this.pbProgrammaticRequests, year);
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push( row );

    row = new Object();
    row["id"] = "Allocated TOA"; 
    sum = 0;
    let allocatedToas: { [year: number]: number } = {};
    this.pom.communityToas.forEach((toa) => {
      allocatedToas[toa.year] = toa.amount;
      row[toa.year] = toa.amount;
      sum += row[toa.year];
    });
    row["total"] = sum;
    rowdata.push( row );

    row= new Object();
    row["id"] = "POM 18 Requests"; 
    sum = 0;
    let pomRequests: { [year: number]: number } = {};
          for (let year: number = by; year < by + 5; year++) {
      pomRequests[year] = this.aggregateToas(this.pomProgrammaticRequests, year);
      row[year]  = this.aggregateToas(this.pomProgrammaticRequests, year);
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push( row );

    row= new Object();
    row["id"] = "TOA Difference"; 
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      
      row[year] = allocatedToas[year] - pomRequests[year];
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push( row );

    this.rowsData = rowdata;
  }

  private aggregateToas(prs: ProgramRequestWithFullName[], year: number): number {
    return prs.map(pr => new UiProgrammaticRequest(pr).getToa(year)).reduce((a, b) => a + b, 0);
  }
}