import {Component, Input} from '@angular/core';
import {WorksheetComponent} from "./../worksheet/worksheet.component";

@Component({
  selector: 'filter-text',
  templateUrl: './filter-text.component.html'
})
export class FilterTextComponent {

  @Input() worksheetComponent: WorksheetComponent;
  filterText: string;

  onFilterTextBoxChanged() {
    this.worksheetComponent.agGrid.gridOptions.api.setQuickFilter( this.filterText );
  }

}
