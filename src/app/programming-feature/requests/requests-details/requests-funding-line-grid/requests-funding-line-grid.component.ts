import { Component, Input, OnInit } from '@angular/core';
import { ColumnApi, GridApi } from '@ag-grid-community/all-modules';
import { DataGridMessage } from '../../../../pfm-coreui/models/DataGridMessage';
import { FundingData } from '../../../models/FundingData';
import { AttachmentCellRendererComponent } from '../../../../pfm-coreui/datagrid/renderers/attachment-cell-renderer/attachment-cell-renderer.component';
import { TreeCellRendererComponent } from '../../../../pfm-coreui/datagrid/renderers/tree-cell-renderer/tree-cell-renderer.component';

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
        headerName: 'APPN',
        field: 'appropriation',
        editable:false,
        cellClass: "pfm-datagrid-text pfm-datagrid-text-underline pfm-datagrid-lightgreybg",
        cellRendererFramework: TreeCellRendererComponent
      },
      {
        headerName: 'BA/BLIN',
        field: 'baOrBlin',
        editable: false,
        cellClass: "pfm-datagrid-text pfm-datagrid-lightgreybg",
        cellRendererFramework: TreeCellRendererComponent
      },
      {
        headerName: 'SAG',
        field: 'sag',
        editable: false,
        cellClass: "pfm-datagrid-text pfm-datagrid-lightgreybg",
        cellRendererFramework: TreeCellRendererComponent
      },
      {
        headerName: 'WUCD',
        field: 'wucd',
        editable: false,
        cellClass: "pfm-datagrid-text pfm-datagrid-lightgreybg",
        cellRendererFramework: TreeCellRendererComponent
      }];

    this.columnsToSum = [
      {
        headerName: 'FY18',
        field: 'fy18',
        editable: false,
        cellClass: "pfm-datagrid-numeric-class pfm-datagrid-lightgreybg",
      },
      {
        headerName: 'FY19',
        field: 'fy19',
        editable: false,
        cellClass: "pfm-datagrid-numeric-class pfm-datagrid-lightgreybg",
      },
      {
        headerName: 'FY20',
        field: 'fy20',
        editable: false,
        cellClass: "pfm-datagrid-numeric-class pfm-datagrid-lightgreybg",
      }
      ,
      {
        headerName: 'FY21',
        field: 'fy21',
        editable: false,
        cellClass: "pfm-datagrid-numeric-class pfm-datagrid-lightgreybg",
      }
      ,
      {
        headerName: 'FY22',
        field: 'fy22',
        editable: false,
        cellClass: "pfm-datagrid-numeric-class pfm-datagrid-lightgreybg",
      }
      ,
      {
        headerName: 'FY23',
        field: 'fy23',
        editable: false,
        cellClass: "pfm-datagrid-numeric-class pfm-datagrid-lightgreybg",
      }
      ,
      {
        headerName: 'FY24',
        field: 'fy24',
        editable: false,
        cellClass: "pfm-datagrid-numeric-class pfm-datagrid-lightgreybg",
      }
      ,
      {
        headerName: 'FY25',
        field: 'fy25',
        editable: false,
        cellClass: "pfm-datagrid-numeric-class pfm-datagrid-lightgreybg",
      }
      ,
      {
        headerName: 'FYTotal',
        field: 'fyTotal',
        editable: false,
        cellClass: "pfm-datagrid-numeric-class pfm-datagrid-lightgreybg",
      }
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
    this.fundingData.push(this.makeData("1", "O&M", "BA4", "x", "radio"));
    this.fundingData.push(this.makeData("2", "O&M", "BA4", "x", "radio"));
    this.fundingData.push(this.makeData("3", "O&M", "BA5", "x", "radio"));

    this.fundingData.push(this.makeData("7", "MILCON", "BA1", "AA", "radio"));
    this.fundingData.push(this.makeData("8", "MILCON", "BA1", "AB", "radio"));


  }

  private makeData(id:string, appropriation:string, baOrBlin:string, sag:string, wucd:string):FundingData{
    let data:FundingData = new FundingData();
    data.id = id;
    data.appropriation = appropriation;
    data.baOrBlin = baOrBlin;
    data.sag = sag;
    data.wucd = wucd;
    data.fy18 = 1;
    data.fy19 = 1;
    data.fy20 = 1;
    data.fy21 = 1;
    data.fy22 = 1;
    data.fy23 = 1;
    data.fy24 = 1;
    data.fy25 = 1;
    data.fyTotal = 1;
    return data;
  }
}
