import { Component, OnInit } from '@angular/core';
import { ActionCellRendererComponent } from '../action-cell-renderer/action-cell-renderer.component';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';
import { ListItem } from '../../../../pfm-common-models/ListItem';

@Component({
  selector: 'app-funds-update-action-cell-renderer',
  templateUrl: './funds-update-action-cell-renderer.component.html',
  styleUrls: ['./funds-update-action-cell-renderer.component.scss']
})
export class FundsUpdateActionCellRendererComponent extends ActionCellRendererComponent implements OnInit {
  dollarOptions: ListItem[];

  agInit(params) {
    super.agInit(params);

    const item: ListItem = new ListItem();
    item.name = 'BTR';
    item.value = 'btr';
    item.id = 'btr';
    const item2: ListItem = new ListItem();
    item2.name = 'Realign';
    item2.value = 'realign';
    item2.id = 'realign';
    this.dollarOptions = [item, item2];
  }

  handleFunds(item: ListItem) {}
}
