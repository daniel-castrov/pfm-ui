import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from "ag-grid/dist/lib/rendering/cellRenderers/iCellRenderer";

// *ngIf="params.value.id" below is needed to address some case where RouterLink somehow tries to render the link before params.value.id is initialized
@Component({
  template: `<a *ngIf="params.value.id" [routerLink]="params.value.locked? [] : ['/view-pom-session',params.value.id]">
              <span class="worksheet-lock" *ngIf="params.value.locked">
                <i class="fa fa-lock" aria-hidden="true"></i>
              </span>
              {{params.value.name}}
            </a>`
})
export class NameViewingRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;

  agInit(param: ICellRendererParams) {
    this.params = param;
  }

  refresh(): boolean {
    return true;
  }

}
