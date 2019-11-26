import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DatagridMbService } from '../../../services/datagrid-mb.service';
import { DataGridMessage } from '../../../models/DataGridMessage';
import {AllCommunityModules, ColumnApi, GridApi, Module} from '@ag-grid-community/all-modules';
import { ListItem } from 'src/app/planning-feature/models/ListItem';

@Component({
  selector: 'pfm-action-cell-renderer',
  templateUrl: './action-cell-renderer.component.html',
  styleUrls: ['./action-cell-renderer.component.scss']
})
export class ActionCellRendererComponent implements OnInit {

  data: any;
  params: any;
  public api: GridApi;
  public columnApi: ColumnApi;
  public options:ListItem[];

  constructor(private datagridMBService:DatagridMbService){}

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

  handleDelete(item:ListItem):void{
    if(item){
      if(item.id === "delete-row"){
        this.onSelected(item.id);
      }
      else if (item.id === "delete-attatchments"){
        this.onSelected(item.id);
      }
    }
  }

  agInit(params) {
    this.params = params;
    this.data =  params.value;
  }

  ngOnInit() {
    let item:ListItem = new ListItem();
    item.name = "Delete Row";
    item.value = "delete-row";
    item.id = "delete-row";
    let item2:ListItem = new ListItem();
    item2.name = "Delete Attatchment(s)";
    item2.value = "delete-attatchments";
    item2.id = "delete-attatchments";
    this.options = [item, item2];
  }

}
