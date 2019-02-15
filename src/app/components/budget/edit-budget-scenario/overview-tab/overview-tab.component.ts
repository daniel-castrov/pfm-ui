import { Component, OnChanges, Input, ViewChild } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import { AgGridNg2 } from "ag-grid-angular"; 
import { Budget, PB, R0R1Data, FileResponse, LibraryService } from '../../../../generated';

@Component({
  selector: 'overview-tab',
  templateUrl: './overview-tab.component.html',
  styleUrls: ['../edit-budget-scenario.component.scss']
})
export class OverviewTabComponent implements OnChanges {

  @Input() scenario: PB;
  @Input() budget: Budget;
  @Input() r0r1data: R0R1Data;
  @Input() editable: boolean;

  ovFileName:string;

  @ViewChild("agGrid") private agGrid: AgGridNg2;
  rowsData: any[]=[];
  colDefs;

  constructor(
    private sanitization: DomSanitizer,
    private libraryService:LibraryService ) { }

  ngOnChanges() {

    if ( this.r0r1data && this.r0r1data.r1Name ){
      this.ovFileName = this.r0r1data.r1Name;
    }

    this.initGrid();
    this.populateRowData();

  }

  ovHandleFileInput(files: FileList) {
    let ovFileToUpload:File = files.item(0);
    this.libraryService.uploadFile(ovFileToUpload, this.r0r1data.fileArea).subscribe(response => {
      if (response.result) {
        this.r0r1data.overviewId = response.result.id;
        this.r0r1data.overviewName = ovFileToUpload.name;
        this.ovFileName = ovFileToUpload.name;
        // console.log(this.r0r1data);
      } else if (response.error) {
        console.log( "Something went wrong with the overview file upload" );
        console.log( response.error );
      } else {
        console.log( "Something went wrong with the overview file upload" );
      }
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

  private initGrid() {
    this.agGrid.gridOptions = {
      columnDefs: this.setAgGridColDefs(),
    }
  }

  setAgGridColDefs() :any {

    // First column - id
    this.colDefs =
      [{
        headerName: "Program Element",
        suppressMenu: true,
        field: 'pe',
        maxWidth: 110,
        editable: false,
        cellClass: "font-weight-bold"
      }];

      this.colDefs.push(
        {
          headerName: "Line #",
          suppressMenu: true,
          field: 'lineItem',
          maxWidth: 110,
          editable: true
        });
    }

    private populateRowData() {

      let rowdata:any[] = [];

      Object.keys(this.r0r1data.toc).forEach(key => {
        let row = new Object();
        row["pe"] = key;
        row["lineItem"] =  this.r0r1data.toc[key];
        rowdata.push(row);
      });
      this.rowsData = rowdata;
    }

}

