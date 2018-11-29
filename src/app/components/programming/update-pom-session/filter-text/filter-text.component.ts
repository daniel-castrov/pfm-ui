import {Component, Input, ViewEncapsulation} from '@angular/core';
import {WorksheetComponent} from "./../worksheet/worksheet.component";

@Component({
  selector: 'filter-text',
  templateUrl: './filter-text.component.html',
  styleUrls: ['./filter-text.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FilterTextComponent {

  @Input() worksheetComponent: WorksheetComponent;
  filterText;

  onFilterTextBoxChanged() {
    this.worksheetComponent.agGrid.gridOptions.api.setQuickFilter( this.filterText );
  }

}
