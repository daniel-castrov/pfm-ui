import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from "ag-grid-community/dist/lib/rendering/cellRenderers/iCellRenderer";

// *ngIf="params.value.id" below is needed to address some case where RouterLink somehow tries to render the link before params.value.id is initialized
@Component({
  template: `<a [class]="params.value.locked? 'isDisabled': ''" *ngIf="params.value.id" [routerLink]="params.value.locked? [] : ['/update-pom-session',params.value.id]">
              <span class="worksheet-lock">
                <i class="fa fa-bolt" aria-hidden="true"> </i>
              </span>
            </a>`
})
export class BulkChangeRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;

  agInit(param: ICellRendererParams) {
    this.params = param;
  }

  refresh(): boolean {
    return true;
  }

}
