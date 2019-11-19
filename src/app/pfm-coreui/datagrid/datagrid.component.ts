import { Component, Input, OnInit } from '@angular/core';
import {AllCommunityModules} from '@ag-grid-community/all-modules';

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css'
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';

@Component({
  selector: 'pfm-datagrid',
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.scss']
})
export class DatagridComponent implements OnInit {

  @Input() columns:any;
  @Input() rows:any;

  gridReady:boolean;
  gridOptions:any;
  modules = AllCommunityModules;

  constructor() {

  }

  ngOnInit() {
    this.gridOptions = {
      defaultColDef: {
        width: 100,
        sortable: true,
        resizable: true
      },
      rowHeight: 50,
      rowSelection: 'single',
      columnDefs: this.columns,
      rowData: this.rows,
    };

    this.gridReady = true;
  }

}
