import { Component, Input, OnInit } from '@angular/core';
import { ColumnApi, GridApi } from '@ag-grid-community/all-modules';
import { DataGridMessage } from '../../../pfm-coreui/models/DataGridMessage';
import { FundingData } from '../../models/FundingData';
import { AttachmentCellRendererComponent } from '../../../pfm-coreui/datagrid/renderers/attachment-cell-renderer/attachment-cell-renderer.component';
import { TreeCellRendererComponent } from '../../../pfm-coreui/datagrid/renderers/tree-cell-renderer/tree-cell-renderer.component';

@Component({
  selector: 'pfm-requests-funding-line-grid',
  templateUrl: './requests-funding-line-grid.component.html',
  styleUrls: ['./requests-funding-line-grid.component.scss']
})
export class RequestsFundingLineGridComponent implements OnInit {

  fundingData:FundingData[];
  gridApi:GridApi;
  columnApi:ColumnApi;
  columnsToGroup:any[];
  columnsToSum:any[];

  id:string = 'requests-funding-line-grid-component';
  busy:boolean;

  constructor() {
    this.columnsToGroup = [
      {
        headerName: 'ALC',
        field: 'alc',
        editable:false,
        cellClass: "pfm-datagrid-text pfm-datagrid-text-underline pfm-datagrid-lightgreybg",
        cellRendererFramework: TreeCellRendererComponent
      },
      {
        headerName: 'MAJCOM',
        field: 'majcom',
        editable: false,
        cellClass: "pfm-datagrid-text pfm-datagrid-lightgreybg",
        cellRendererFramework: TreeCellRendererComponent
      },
      {
        headerName: 'BASE',
        field: 'mbase',
        editable: false,
        cellClass: "pfm-datagrid-text pfm-datagrid-lightgreybg",
        cellRendererFramework: TreeCellRendererComponent
      },
      {
        headerName: 'NSN',
        field: 'nsn',
        editable: false,
        cellClass: "pfm-datagrid-text pfm-datagrid-lightgreybg",
        cellRendererFramework: TreeCellRendererComponent
      }];

    this.columnsToSum = [
      {
        headerName: 'FY1',
        field: 'fy1',
        editable: false,
        cellClass: "pfm-datagrid-numeric-class pfm-datagrid-lightgreybg",
      },
      {
        headerName: 'FY2',
        field: 'fy2',
        editable: false,
        cellClass: "pfm-datagrid-numeric-class pfm-datagrid-lightgreybg",
      },
    ];

    this.createMockData();
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

      }
    }
  }


  onGridIsReady(gridApi:GridApi):void{
    this.gridApi = gridApi;

  }

  onColumnIsReady(columnApi:ColumnApi):void{
    this.columnApi = columnApi;
  }

  ngOnInit(): void {

  }

  private createMockData():void{

    this.fundingData = [];
    this.fundingData.push(this.makeData("1", "WR", "ACC", "B1", "radio"));
    this.fundingData.push(this.makeData("2", "WR", "ACC", "B1", "radio"));
    this.fundingData.push(this.makeData("3", "WR", "ANG", "B1", "radio"));

    this.fundingData.push(this.makeData("7", "PC", "ACC", "B1", "radio"));
    this.fundingData.push(this.makeData("8", "PC", "ACC", "B2", "radio"));


  }

  private makeData(id:string, alc:string, maj:string, bas:string, nsn:string):FundingData{
    let data:FundingData = new FundingData();
    data.id = id;
    data.alc = alc;
    data.majcom = maj;
    data.mbase = bas;
    data.nsn = nsn;
    data.fy1 = 1;
    data.fy2 = 10;
    data.fy3 = 20;
    data.fy4 = 50;
    return data;
  }
}
