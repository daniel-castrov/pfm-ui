import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {AllCommunityModules, ColumnApi, GridApi, Module} from '@ag-grid-community/all-modules';

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

  public defaultColDef: any;
  public modules: Module[] = AllCommunityModules;
  public api: GridApi;
  public columnApi: ColumnApi;

  constructor(private datagridMBService:DatagridMbService) {
    datagridMBService.messageBus$.subscribe(message => {
      this.onCellAction.emit(message);
    });

    this.defaultColDef = {
      resizable: true,
      sortable: true,
      filter: true,
    };
  }

  public onModelUpdated() {
    console.log('onModelUpdated');
  }

  public onGridReady(params) {
    console.log('onGridReady');
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

  ngOnInit() {
  }

}
