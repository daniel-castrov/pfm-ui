import {Component, Input} from '@angular/core';
import {WorksheetComponent} from "../worksheet/worksheet.component";
import {GridToaComponent} from "../grid-toa/grid-toa.component";
import {RowNode} from "ag-grid";
import { WorkspaceComponent } from '../workspace/workspace.component';

@Component({
  selector: 'bulk-changes',
  templateUrl: './bulk-changes.component.html',
  styleUrls: ['./bulk-changes.component.scss'],
})
export class BulkChangesComponent {

  @Input() worksheetComponent: WorksheetComponent;
  @Input() workspaceComponent: WorkspaceComponent;
  @Input() columnKeys;
  @Input() gridToaComponent: GridToaComponent;
  bulkType: string;
  bulkAmount: number;

  applyBulkChange() {
    this.worksheetComponent.agGrid.api.forEachNodeAfterFilterAndSort((rowNode: RowNode) => {
      if (rowNode.rowIndex <= this.worksheetComponent.agGrid.api.getLastDisplayedRow()) {
        this.columnKeys.forEach(year => {
          let additionalAmount = 0;
          if (this.bulkType === 'percentage') {
            additionalAmount = rowNode.data.fundingLine.funds[year] * (this.bulkAmount / 100);
          } else {
            additionalAmount = this.bulkAmount;
          }
          rowNode.data.fundingLine.funds[year] = (isNaN(rowNode.data.fundingLine.funds[year])? 0 : rowNode.data.fundingLine.funds[year]) + additionalAmount;
          rowNode.data.modified = true;
          rowNode.setSelected(true);
          if (rowNode.data.fundingLine.funds[year] < 0) {
            rowNode.data.fundingLine.funds[year] = 0;
          }
        });
      }
    });

    this.worksheetComponent.topPinnedData.forEach(row => {
      this.columnKeys.forEach(year => {
        let additionalAmount = 0;
        if (this.bulkType === 'percentage') {
          additionalAmount = row.fundingLine.funds[year] * (this.bulkAmount / 100);
        } else {
          additionalAmount = this.bulkAmount;
        }
        row.fundingLine.funds[year] = (isNaN(row.fundingLine.funds[year])? 0 : row.fundingLine.funds[year]) + additionalAmount;
        row.modified = true;
        if (row.fundingLine.funds[year] < 0) {
          row.fundingLine.funds[year] = 0;
        }
      });
    });

    this.bulkAmount = null;
    this.worksheetComponent.agGrid.api.redrawRows();
    this.gridToaComponent.initToaDataRows();
  }

}
