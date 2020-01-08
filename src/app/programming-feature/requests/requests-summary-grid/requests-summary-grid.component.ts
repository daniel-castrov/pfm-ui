import { Component, Input, OnInit } from '@angular/core';
import { GridApi, ColumnApi, RowNode, Column, CellPosition } from '@ag-grid-community/all-modules';
import { FormatterUtil } from '../../../util/formatterUtil';
import { ProgrammingService } from '../../services/programming-service';
import { DialogService } from '../../../pfm-coreui/services/dialog.service';
import { ProgramRequestForPOM } from '../../models/ProgramRequestForPOM';

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
        cellClass: "pfm-datagrid-text pfm-datagrid-text-underline",
      },
      {
        headerName: 'Status',
        field: 'status',
        editable: false,
        cellClass: "pfm-datagrid-text pfm-datagrid-warning pfm-datagrid-text-underline",
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

  onGridIsReady(gridApi:GridApi):void{
    this.gridApi = gridApi;
  }

  onColumnIsReady(columnApi:ColumnApi):void{
    this.columnApi = columnApi;
  }

  ngOnInit() {


  }

}
