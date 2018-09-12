import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-actuals-cell-renderer',
  templateUrl: './actuals-cell-renderer.component.html',
  styleUrls: ['./actuals-cell-renderer.component.scss']
})
export class ActualsCellRendererComponent implements ICellRendererAngularComp {
  private params;
  private printable: boolean = true;

  constructor() { }

  agInit(param) {
    this.params = param;
    console.log(param);
    console.log('rendering at (' + param.rowIndex + ',' + param.colDef.colId + '): ' + JSON.stringify(this.params.data));

    this.printable = ((param.context.firstMonth + param.colDef.colId) <= param.context.editMonth);
  }

  refresh(): boolean {
    return true;
  }


}
