import { Component, OnInit } from '@angular/core';
import { DatagridMbService } from '../../../services/datagrid-mb.service';
import { DataGridMessage } from '../../../models/DataGridMessage';

@Component({
  selector: 'pfm-action-cell-renderer',
  templateUrl: './action-cell-renderer.component.html',
  styleUrls: ['./action-cell-renderer.component.scss']
})
export class ActionCellRendererComponent implements OnInit {

  data: any;
  params: any;

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

  agInit(params) {
    this.params = params;
    this.data =  params.value;
  }

  ngOnInit() {}
}
