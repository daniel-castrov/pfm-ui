import { Component, OnInit } from '@angular/core';
import { ActionCellRendererComponent } from '../action-cell-renderer/action-cell-renderer.component';

@Component({
  selector: 'pfm-wksp-action-cell-renderer',
  templateUrl: './wksp-action-cell-renderer.component.html',
  styleUrls: ['./wksp-action-cell-renderer.component.scss']
})
export class WkspActionCellRendererComponent extends ActionCellRendererComponent implements OnInit {
  agInit(params) {
    super.agInit(params);
  }
}
