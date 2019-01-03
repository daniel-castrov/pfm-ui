import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'library-view-cell-renderer',
  templateUrl: './library-view-cell-renderer.component.html',
  styleUrls: ['./library-view-cell-renderer.component.scss']
})
export class LibraryViewCellRenderer implements ICellRendererAngularComp {
  private params;

  constructor() {
  }

  agInit(param) {
    this.params = param;
  }

  openFile() {
    this.params.context.parentComponent.openFile(this.params.data.metadata.fileid, this.params.data.metadata.area);
  }

  id(): string{
    return this.params.data.id;
  }

  refresh(): boolean {
    return true;
  }
}
