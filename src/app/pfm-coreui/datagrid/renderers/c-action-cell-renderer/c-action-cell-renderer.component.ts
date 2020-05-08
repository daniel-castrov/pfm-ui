import { Component, Input, OnInit } from '@angular/core';
import { ActionCellRendererComponent } from '../action-cell-renderer/action-cell-renderer.component';

@Component({
  selector: 'pfm-c-action-cell-renderer',
  templateUrl: './c-action-cell-renderer.component.html',
  styleUrls: ['./c-action-cell-renderer.component.scss']
})
export class CActionCellRendererComponent extends ActionCellRendererComponent implements OnInit {
  title = '';

  @Input()
  hideStatus: boolean;

  agInit(params) {
    super.agInit(params);
    this.title = this.params.value.canView ? 'View details' : 'In use';
  }
}
