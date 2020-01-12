import { Component, Input, OnInit } from '@angular/core';
import { GridApi, ColumnApi, RowNode, Column, CellPosition } from '@ag-grid-community/all-modules';
import { FormatterUtil } from '../../../util/formatterUtil';
import { ProgrammingService } from '../../services/programming-service';
import { DialogService } from '../../../pfm-coreui/services/dialog.service';
import { ProgramRequestForPOM } from '../../models/ProgramRequestForPOM';
import { DataGridMessage } from '../../../pfm-coreui/models/DataGridMessage';

@Component({
  selector: 'pfm-requests-summary-grid',
  templateUrl: './requests-summary-grid.component.html',
  styleUrls: ['./requests-summary-grid.component.scss']
})
export class RequestsSummaryGridComponent implements OnInit {

  @Input() griddata:ProgramRequestForPOM[];

  gridApi:GridApi;
  columnApi:ColumnApi;
  columns:any[];


  id:string = 'requests-summary-component';
  busy:boolean;

  constructor(private programmingService:ProgrammingService, private dialogService:DialogService) {
    this.columns = [
      {
        headerName: 'Program',
        field: 'programName',
        editable:false,
        cellClass: "pfm-datagrid-text pfm-datagrid-text-underline pfm-datagrid-lightgreybg",
      },
      {
        headerName: 'Assigned To',
        field: 'assignedTo',
        editable: false,
        cellClass: "pfm-datagrid-text pfm-datagrid-lightgreybg",
      },
      {
        headerName: 'Status',
        field: 'status',
        editable: false,
        cellClass: "pfm-datagrid-text pfm-datagrid-warning pfm-datagrid-lightgreybg",
      },
    ];
    for(let i=16; i<19; i++){
      this.columns.push(
        {
          headerName: 'FY' + i,
          field: 'fy_' + i,
          maxWidth: 100,
          minWidth: 100,
          rowDrag: false,
          cellClass: "pfm-datagrid-numeric-class",
          valueGetter(params) {
            let value = "$" + (params.data[params.colDef.field]).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');;
            return value;
          }
        }
      );
    }
    for(let i=19; i<24; i++){
      this.columns.push(
        {
          headerName: 'FY' + i,
          field: 'fy_' + i,
          maxWidth: 100,
          minWidth: 100,
          rowDrag: false,
          cellClass: "pfm-datagrid-numeric-class  pfm-datagrid-greybg",
          valueGetter(params) {
            let value = "$" + (params.data[params.colDef.field]).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');;
            return value;
          }
        }
      );
    }

    this.columns.push(
      {
        headerName: 'FYDP Total',
        field: 'fydp_total',
        maxWidth: 120,
        minWidth: 120,
        rowDrag: false,
         cellClass: "pfm-datagrid-numeric-class",
        valueGetter(params) {
          let value = "$" + (params.data[params.colDef.field]).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');;
          return value;
          },
      }
    );
  }

  handleCellAction(cellAction:DataGridMessage):void{
    switch(cellAction.message){
      case "save": {
        break;
      }
      case "edit": {
        break;
      }
      case "upload": {
        break;
      }
      case "delete-row": {
        break;
      }
      case "delete-attachments": {
        break;
      }
      case "download-attachment":{
      }
      case "cellClicked":{
        this.onCellClicked(cellAction);
      }
    }
  }

  onCellClicked(cellAction:DataGridMessage):void{
    if(cellAction.columnId === "programName"){
      //navigate to the program details

    }
  }

  onGridIsReady(gridApi:GridApi):void{
    this.gridApi = gridApi;

  }

  onColumnIsReady(columnApi:ColumnApi):void{
    this.columnApi = columnApi;
  }

  ngOnInit() {


  }

}
