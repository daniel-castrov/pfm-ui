import { Component, Input, OnInit } from '@angular/core';
import { ActionCellRendererComponent } from '../action-cell-renderer/action-cell-renderer.component';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';

@Component({
  selector: 'pfm-prs-action-cell-renderer',
  templateUrl: './prs-action-cell-renderer.component.html',
  styleUrls: ['./prs-action-cell-renderer.component.scss']
})
export class PrsActionCellRendererComponent extends ActionCellRendererComponent implements OnInit {
  agInit(params) {
    super.agInit(params);
  }

  deleteProgram() {
    const message: DataGridMessage = new DataGridMessage();
    message.rowIndex = this.params.rowIndex;
    message.columnIndex = -1;
    message.message = 'delete-program';
    message.rendererName = 'PrsActionCellRendererComponent';
    message.rowData = this.data;
    message.messageType = 'cell-renderer';
    message.apiCompId = this.params.api.gridCore.compId;
    this.datagridMBService.sendMessage(message);
  }
}
