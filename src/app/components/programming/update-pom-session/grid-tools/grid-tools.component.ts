import {Component, Input, ViewEncapsulation} from '@angular/core';
import {WorksheetComponent} from "./../worksheet/worksheet.component";

@Component({
  selector: 'grid-tools',
  templateUrl: './grid-tools.component.html',
  encapsulation: ViewEncapsulation.None
})
export class GridToolsComponent {

  @Input() worksheetComponent: WorksheetComponent;
  filterText;

  onFilterTextBoxChanged() {
    this.worksheetComponent.agGrid.gridOptions.api.setQuickFilter( this.filterText );
  }

  onPageSizeChanged(event) {
    var selectedValue = Number(event.target.value);
    this.worksheetComponent.agGrid.api.paginationSetPageSize(selectedValue);
    this.worksheetComponent.agGrid.api.sizeColumnsToFit();
  }
}
