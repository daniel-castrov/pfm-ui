import { Component, OnChanges, Input, ViewChild } from '@angular/core';
import { AgGridNg2 } from "ag-grid-angular"; 
import { Budget, PB, RdteData, LibraryService } from '../../../../generated';

@Component({
  selector: 'overview-tab',
  templateUrl: './overview-tab.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class OverviewTabComponent implements OnChanges {

  @Input() scenario: PB;
  @Input() budget: Budget;
  @Input() rdteData: RdteData;
  @Input() editable: boolean;

  ovFileName:string;

  @ViewChild("agGrid") private agGrid: AgGridNg2;
  rowsData: any[]=[];
  colDefs;

  constructor( private libraryService:LibraryService ) { }

  ngOnChanges() {

    if ( this.rdteData && this.rdteData.overviewName ){
      this.ovFileName = this.rdteData.overviewName;
      this.initGrid();
      this.populateRowData();
    }
    // } else {
    //   this.ovFileName = "";
    // }



    
  }

  ovHandleFileInput(files: FileList) {
    let ovFileToUpload:File = files.item(0);
    this.libraryService.uploadFile(ovFileToUpload, this.rdteData.fileArea).subscribe(response => {
      if (response.result) {
        this.rdteData.overviewId = response.result.id;
        this.rdteData.overviewName = ovFileToUpload.name;
        this.ovFileName = ovFileToUpload.name;
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
          editable: true,
          cellClass: "ag-cell-edit"
          onCellValueChanged: params => this.onValueChanged(params),
        });
    }

    private populateRowData() {

      let rowdata:any[] = [];

      Object.keys(this.rdteData.toc).forEach(key => {
        let row = new Object();
        row["pe"] = key;
        row["lineItem"] =  this.rdteData.toc[key];
        rowdata.push(row);
      });
      this.rowsData = rowdata;
    }

    private onValueChanged(params){
      this.rdteData.toc[ params.data.pe ] = params.data.lineItem;
    }

}

