import {Component, Input} from '@angular/core';
import {AgGridNg2} from "ag-grid-angular/main";

@Component({
  selector: 'grid-rows',
  templateUrl: './grid-rows.component.html'
})
export class GridRowsComponent {

  @Input() agGrid: AgGridNg2;

  onPageSizeChanged(event) {
    var selectedValue = Number(event.target.value);
    this.agGrid.api.paginationSetPageSize(selectedValue);
    this.agGrid.api.sizeColumnsToFit();
  }
}
