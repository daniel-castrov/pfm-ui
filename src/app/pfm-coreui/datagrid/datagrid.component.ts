import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {AllCommunityModules} from '@ag-grid-community/all-modules';

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css'
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';
import { DialogService } from '../services/dialog.service';
import { DatagridMbService } from '../services/datagrid-mb.service';
import { DataGridMessage } from '../models/DataGridMessage';

@Component({
  selector: 'pfm-datagrid',
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.scss']
})
export class DatagridComponent implements OnInit {

  @Input() columns:any;
  @Input() rows:any;
  @Output() onCellAction:EventEmitter<DataGridMessage> = new EventEmitter<DataGridMessage>();

  gridReady:boolean;
  gridOptions:any;
  modules = AllCommunityModules;

  constructor(private datagridMBService:DatagridMbService) {
    datagridMBService.messageBus$.subscribe(message => {
      this.onCellAction.emit(message);
    });
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
