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
    var row: number = param.rowIndex;
    var col: number = Number.parseInt(param.colDef.colId);
    var monthidx: number = param.context.parent.firstMonth + col;

    //console.log('rendering at (' + param.rowIndex + ',' + param.colDef.colId + '): ' + JSON.stringify(this.params.data));
    this.printable = (param.context.parent.isadmin || monthidx <= param.context.parent.editMonth);
    var pct = param.context.parent.showPercentages;

    //console.log(param.data);
    //console.log(row + ', ' + col);

    if (pct && row > 1) {
      this.value = (0 === param.data.toa[monthidx]
        ? 0
        : param.value / param.data.toa[monthidx] * 100).toFixed(2);
    }
    else {
      this.value = (param.value ? param.value : 0).toFixed(2);
    }
  }

  refresh(): boolean {
    return true;
  }
}
