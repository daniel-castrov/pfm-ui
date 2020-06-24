import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListItem } from '../../../../pfm-common-models/ListItem';
import { DatagridMbService } from '../../../services/datagrid-mb.service';
import { DataGridMessage } from '../../../models/DataGridMessage';
import { ListItemHelper } from 'src/app/util/ListItemHelper';

@Component({
  selector: 'pfm-dropdown-cell-renderer',
  templateUrl: './dropdown-cell-renderer.component.html',
  styleUrls: ['./dropdown-cell-renderer.component.scss']
})
export class DropdownCellRendererComponent {
  @Input()
  list: ListItem[];
  data: any;
  params: any;
  selectedValue: any;
  @Output()
  change: EventEmitter<any> = new EventEmitter<any>();
  @Input() disablePrompt = false;

  constructor(private datagridMBService: DatagridMbService) {}

  handleSelectionChanged(data: any): void {
    const message: DataGridMessage = new DataGridMessage();
    message.rowIndex = this.params.rowIndex;
    message.columnIndex = -1; // not used - we know the column based on the action
    message.message = 'selection-changed';
    message.rendererName = 'DropdownCellRendererComponent';
    message.rowData = this.data;
    message.rawData = data.rawData;
    message.messageType = 'cell-renderer';
    message.apiCompId = this.params.api.gridCore.compId;
    this.selectedValue = data.rawData;
    this.datagridMBService.sendMessage(message);
    this.change.emit();
  }

  getValue(): string {
    return this.selectedValue;
  }

  agInit(params) {
    this.selectedValue = params.value;
    this.params = params;
    this.data = params.values;
    this.updateList(this.data);
  }

  updateList(options: string[] | string[][]) {
    this.list = ListItemHelper.generateListItemFromArray(options, this.selectedValue);
    this.change.emit();
  }
}
