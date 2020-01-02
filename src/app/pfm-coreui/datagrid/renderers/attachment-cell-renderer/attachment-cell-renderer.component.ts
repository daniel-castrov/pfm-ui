import { Component, OnInit } from '@angular/core';
import { ListItem } from '../../../../pfm-common-models/ListItem';
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
  attachmentsDisabled:boolean;

  constructor(private datagridMBService:DatagridMbService){}

  handleSelectionChanged(data:any):void{
    let message:DataGridMessage = new DataGridMessage();
    message.rowIndex = this.params.rowIndex;
    message.columnIndex = -1;//not used - we know the column based on the action
    message.message = "download-attachment";
    message.rendererName = "AttachmentCellRendererComponent";
    message.rowData = this.data;
    message.rawData = data.rawData;
    message.messageType = "cell-renderer";
    this.datagridMBService.sendMessage(message);
  }

  agInit(params) {
    this.params = params;
    this.data =  params.value;

    this.list = [];
    for(let x of this.data){
      let item:ListItem = new ListItem();
      item.name = x.file.name;
      item.value = x.file.name;
      item.id = x.id;
      item.rawData = x;
      this.list.push(item);
    }
    console.log('attachmentRenderer');
    this.attachmentsDisabled = this.params.data.attachmentsDisabled;
    console.log(this.attachmentsDisabled);
  }

  ngOnChanges() {

  }

  ngOnInit() {}

}
