import { Component, OnInit } from '@angular/core';
import { ListItem } from '../../../../planning-feature/models/ListItem';
import { DatagridMbService } from '../../../services/datagrid-mb.service';
import { DataGridMessage } from '../../../models/DataGridMessage';

@Component({
  selector: 'pfm-attachment-cell-renderer',
  templateUrl: './attachment-cell-renderer.component.html',
  styleUrls: ['./attachment-cell-renderer.component.scss']
})
export class AttachmentCellRendererComponent implements OnInit {

  data: any;
  params: any;

  list:ListItem[];

  constructor(private datagridMBService:DatagridMbService){}

  handleSelectionChanged(data:any):void{
    let message:DataGridMessage = new DataGridMessage();
    message.rowIndex = this.params.rowIndex;
    message.columnIndex = -1;//not used - we know the column based on the action
    message.message = data;
    message.rendererName = "AttachmentCellRendererComponent";
    message.rowData = this.data;
    message.messageType = "cell-renderer";
    this.datagridMBService.sendMessage(message);
  }

  agInit(params) {
    this.params = params;
    this.data =  params.value;

    this.list = [];
    for(let x of this.data){
      let item:ListItem = new ListItem();
      item.name = x.name;
      item.value = x.name;
      item.id = x.name;
      this.list.push(item);
    }
  }

  ngOnInit() {}

}
