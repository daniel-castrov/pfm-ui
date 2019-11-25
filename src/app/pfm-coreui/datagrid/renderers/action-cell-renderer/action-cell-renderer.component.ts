import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DatagridMbService } from '../../../services/datagrid-mb.service';
import { DataGridMessage } from '../../../models/DataGridMessage';
import {AllCommunityModules, ColumnApi, GridApi, Module} from '@ag-grid-community/all-modules';

@Component({
  selector: 'pfm-action-cell-renderer',
  templateUrl: './action-cell-renderer.component.html',
  styleUrls: ['./action-cell-renderer.component.scss']
})
export class ActionCellRendererComponent implements OnInit {

  @Output() onDeleteRowEvent:EventEmitter<any> = new EventEmitter<any>();
  @Output() onEditRowEvent:EventEmitter<any> = new EventEmitter<any>();
  @Output() onSaveRowEvent:EventEmitter<any> = new EventEmitter<any>();
  @Output() onUploadAttatchmentEvent:EventEmitter<any> = new EventEmitter<any>();
  @Output() onDeleteAttatchmentEvent:EventEmitter<any> = new EventEmitter<any>();

  data: any;
  params: any;
  public api: GridApi;
  public columnApi: ColumnApi;

  constructor(private datagridMBService:DatagridMbService){}

  public deleteRow(action:string):void{
    this.onSelected(action);
    this.onDeleteRowEvent.emit({gridApi: this.api, action: 'delete-row'});
  }

  public editRow(action:string):void{
    this.onSelected(action);
    this.onEditRowEvent.emit({gridApi: this.api, action: 'edit-row'});
  }

  public saveRow(action:string):void{
    this.onSelected(action);
    this.onSaveRowEvent.emit({gridApi: this.api, action: 'save-row'});
  }

  public uploadAttatchment(action:string):void{
    this.onSelected(action);
    this.onUploadAttatchmentEvent.emit({gridApi: this.api, action: 'upload-attatchment'});
  }

  public deleteAttatchment(action:string):void{
    this.onSelected(action);
    this.onDeleteAttatchmentEvent.emit({gridApi: this.api, action: 'delete-attatchment'});
  }

  onSelected(action:string):void{
    let message:DataGridMessage = new DataGridMessage();
    message.rowIndex = this.params.rowIndex;
    message.columnIndex = -1;//not used - we know the column based on the action
    message.message = action;
    message.rendererName = "ActionCellRendererComponent";
    message.rowData = this.data;
    message.messageType = "cell-renderer";
    this.datagridMBService.sendMessage(message);
  }

  agInit(params) {
    this.params = params;
    this.data =  params.value;
  }

  ngOnInit() {}
}
