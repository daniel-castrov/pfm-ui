import { Component, OnInit } from '@angular/core';
import { DatagridMbService } from '../../../services/datagrid-mb.service';
import { DataGridMessage } from '../../../models/DataGridMessage';

@Component({
  selector: 'pfm-disabled-action-cell-renderer',
  templateUrl: './disabled-action-cell-renderer.component.html',
  styleUrls: ['./disabled-action-cell-renderer.component.css']
})
export class DisabledActionCellRendererComponent implements OnInit {
  params: any;
  data: any;

  constructor(private datagridMBService: DatagridMbService) {}

  onSelected(action: string): void {
    let message: DataGridMessage = new DataGridMessage();
    message.rowIndex = this.params.rowIndex;
    message.columnIndex = -1; //not used - we know the column based on the action
    message.message = action;
    message.rendererName = 'DisabledActionCellRendererComponent';
    message.rowData = this.data;
    message.messageType = 'cell-renderer';
    this.datagridMBService.sendMessage(message);
  }

  agInit(params) {
    this.params = params;
    this.data = params.value;
  }

  ngOnInit() {}
}
