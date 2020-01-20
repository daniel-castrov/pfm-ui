import { Component, OnInit } from '@angular/core';
import { DataGridMessage } from '../../../models/DataGridMessage';
import { DatagridMbService } from '../../../services/datagrid-mb.service';

@Component({
  selector: 'tree-cell-renderer',
  templateUrl: './tree-cell-renderer.component.html',
  styleUrls: ['./tree-cell-renderer.component.scss']
})
export class TreeCellRendererComponent implements OnInit {

  constructor(private datagridMBService:DatagridMbService){}

  public params: any;
  public value: string;
  public id:string;

  onSelected():void{
    let message:DataGridMessage = new DataGridMessage();
    message.rowIndex = this.params.rowIndex;
    message.columnIndex = -1;//not used - we know the column based on the action
    message.message = "tree-row-expand";
    message.rendererName = "TreeCellRendererComponent";
    message.rowData = this.params.data;
    message.messageType = "cell-renderer";
    this.datagridMBService.sendMessage(message);
  }

  agInit(params: any): void {
    this.params = params;
    this.value = this.params.value;
    this.id = "TextCellRendererComponent" + this.params.rowIndex;
  }

  ngOnInit() {

  }

}
