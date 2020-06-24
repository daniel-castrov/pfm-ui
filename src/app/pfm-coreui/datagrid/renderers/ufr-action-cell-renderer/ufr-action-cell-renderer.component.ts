import { Component, OnInit } from '@angular/core';
import { ActionCellRendererComponent } from '../action-cell-renderer/action-cell-renderer.component';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';

@Component({
  selector: 'pfm-ufr-action-cell-renderer',
  templateUrl: './ufr-action-cell-renderer.component.html',
  styleUrls: ['./ufr-action-cell-renderer.component.scss']
})
export class UfrActionCellRendererComponent extends ActionCellRendererComponent implements OnInit {
  agInit(params) {
    super.agInit(params);
  }

  onSelected(action: string) {
    const message: DataGridMessage = new DataGridMessage();
    message.rowIndex = this.params.rowIndex;
    message.columnIndex = -1;
    message.message = action;
    message.rendererName = 'ufrActionCellRendererComponent';
    message.rowData = this.params.data;
    message.messageType = 'cell-renderer';
    message.apiCompId = this.params.api.gridCore.compId;
    this.datagridMBService.sendMessage(message);
  }
}
