import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-actuals-cell-renderer',
  templateUrl: './actuals-cell-renderer.component.html',
  styleUrls: ['./actuals-cell-renderer.component.scss']
})
export class ActualsCellRendererComponent implements ICellRendererAngularComp {
  private printable: boolean = true;
  private value;
  
  constructor() { }

  agInit(param) {
    //console.log('rendering at (' + param.rowIndex + ',' + param.colDef.colId + '): ' + JSON.stringify(this.params.data));
    this.printable = (param.context.parent.isadmin || (param.context.parent.firstMonth + param.colDef.colId) <= param.context.parent.editMonth);
    var pct = param.context.parent.showPercentages;

    var row: number = param.rowIndex;

    if (pct && row > 1) {
      this.value = (param.value / param.data.toa * 100).toFixed(2);
    }
    else {
      this.value = (param.value ? param.value : 0).toFixed(2);
    }
  }

  refresh(): boolean {
    return true;
  }
}
