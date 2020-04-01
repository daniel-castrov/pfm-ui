import { Component, OnInit, Input } from '@angular/core';
import { ActionCellRendererComponent } from '../action-cell-renderer/action-cell-renderer.component';

@Component({
  selector: 'pfm-mp-action-cell-renderer',
  templateUrl: './mp-action-cell-renderer.component.html',
  styleUrls: ['./mp-action-cell-renderer.component.scss']
})
export class MpActionCellRendererComponent extends ActionCellRendererComponent implements OnInit {
  title = '';

  @Input()
  hideStatus: boolean;

  agInit(params) {
    super.agInit(params);
    this.title = this.params.data.selected
      ? 'Selected for final version'
      : 'Not selected for final version.  Click to select.';
  }
}
