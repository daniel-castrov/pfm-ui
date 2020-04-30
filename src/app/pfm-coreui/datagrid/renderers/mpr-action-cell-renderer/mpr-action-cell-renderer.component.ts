import { Component, OnInit } from '@angular/core';
import { ActionCellRendererComponent } from '../action-cell-renderer/action-cell-renderer.component';

@Component({
  selector: 'pfm-mpr-action-cell-renderer',
  templateUrl: './mpr-action-cell-renderer.component.html',
  styleUrls: ['./mpr-action-cell-renderer.component.scss']
})
export class MprActionCellRendererComponent extends ActionCellRendererComponent implements OnInit {
  agInit(params) {
    super.agInit(params);
  }
}
