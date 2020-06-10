import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { DatagridMbService } from '../../../services/datagrid-mb.service';
import { DataGridMessage } from '../../../models/DataGridMessage';
import { ColumnApi } from '@ag-grid-community/all-modules';
import { ListItem } from 'src/app/pfm-common-models/ListItem';

@Component({
  selector: 'pfm-action-cell-renderer',
  templateUrl: './action-cell-renderer.component.html',
  styleUrls: ['./action-cell-renderer.component.scss']
})
export class ActionCellRendererComponent implements OnInit {
  @Input()
  data: any;
  @Input()
  params: any;
  @Input()
  columnApi: ColumnApi;
  @Input()
  options: ListItem[];
  @Input()
  disabled: boolean;
  @Input()
  extraActions: TemplateRef<any>;

  constructor(protected datagridMBService: DatagridMbService) {}

  onSelected(action: string) {
    const message: DataGridMessage = new DataGridMessage();
    message.rowIndex = this.params.rowIndex;
    message.columnIndex = -1;
    message.message = action;
    message.rendererName = 'ActionCellRendererComponent';
    message.rowData = this.data;
    message.messageType = 'cell-renderer';
    message.apiCompId = this.params.api.gridCore.compId;
    this.datagridMBService.sendMessage(message);
  }

  handleDelete(item: ListItem) {
    if (item) {
      if (item.id === 'delete-row' || item.id === 'delete-attachments') {
        this.onSelected(item.id);
      }
    }
  }

  agInit(params) {
    this.params = params;
    this.data = params.value;

    if (this.data?.hasOwnProperty('editMode')) {
      this.data.editMode = this.data.editMode;
    } else {
      if (this.data) {
        this.data['editMode'] = true;
      }
    }
  }

  ngOnInit() {
    const item: ListItem = new ListItem();
    item.name = 'Delete Row';
    item.value = 'delete-row';
    item.id = 'delete-row';
    const item2: ListItem = new ListItem();
    item2.name = 'Delete Attachment(s)';
    item2.value = 'delete-attachments';
    item2.id = 'delete-attachments';
    this.options = [item, item2];
  }

  disable() {
    this.disabled = true;
  }

  enable() {
    this.disabled = false;
  }
}
