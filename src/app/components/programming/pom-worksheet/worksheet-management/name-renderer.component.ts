import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from "ag-grid/dist/lib/rendering/cellRenderers/iCellRenderer";

@Component({
  template: `<a [routerLink]="['/worksheet',params.value.id]">
              <span class="worksheet-lock" *ngIf="params.value.locked">
                <i class="fa fa-lock" aria-hidden="true"></i>
              </span>
              {{params.value.name}}
            </a>`
})
export class NameRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;

  agInit(param: ICellRendererParams) {
    this.params = param;
  }

  refresh(): boolean {
    return true;
  }

}
