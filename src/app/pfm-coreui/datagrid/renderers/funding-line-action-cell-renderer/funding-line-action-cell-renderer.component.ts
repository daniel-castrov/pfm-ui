import { Component, OnInit } from '@angular/core';
import { ActionCellRendererComponent } from '../action-cell-renderer/action-cell-renderer.component';

@Component({
  selector: 'pfm-funding-line-action-cell-renderer',
  templateUrl: './funding-line-action-cell-renderer.component.html',
  styleUrls: ['./funding-line-action-cell-renderer.component.scss']
})
export class FundingLineActionCellRendererComponent extends ActionCellRendererComponent implements OnInit {
  agInit(params) {
    super.agInit(params);
  }
}
