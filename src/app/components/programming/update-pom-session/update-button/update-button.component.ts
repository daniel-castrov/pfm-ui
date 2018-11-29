import {Component, Input, ViewEncapsulation} from '@angular/core';
import {Worksheet, WorksheetEvent, WorksheetService} from "../../../../generated";
import {Notify} from "../../../../utils/Notify";
import {RowUpdateEventData} from "../../../../generated/model/rowUpdateEventData";
import {WorksheetComponent} from "./../worksheet/worksheet.component";
import {ReasonCodeComponent} from "./../reason-code/reason-code.component";

@Component({
  selector: 'update-button',
  templateUrl: './update-button.component.html',
  styleUrls: ['./update-button.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpdateButtonComponent {

  @Input() private worksheetComponent: WorksheetComponent;
  @Input() private reasonCodeComponent: ReasonCodeComponent;
  @Input() selectedWorksheet: Worksheet;

  constructor( private worksheetService: WorksheetService ) {}

  update(): boolean  {
    if(!this.reasonCodeComponent.reasonCode) {
      Notify.error('You must select or create a reason code.');
      return;
    }

    let updateData: RowUpdateEventData [] = [];
    this.worksheetComponent.agGrid.api.getSelectedNodes().forEach(node => {
      let modifiedRow: RowUpdateEventData = {};
      modifiedRow.notes = node.data.notes;
      modifiedRow.newFundingLine = node.data.fundingLine;
      modifiedRow.previousFundingLine = this.worksheetComponent.unmodifiedFundingLines.find(ufl =>
        ufl.fundingLine.id === node.data.fundingLine.id).fundingLine;
      modifiedRow.reasonCode = this.reasonCodeComponent.reasonCode;
      modifiedRow.worksheetId = this.selectedWorksheet.id;
      modifiedRow.programId = node.data.programId
      modifiedRow.fundingLineId = node.data.fundingLine.id;
      updateData.push(modifiedRow);

      node.data.modified = false;
      node.setSelected(false);
      node.data.notes = '';
    });
    this.reasonCodeComponent.reasonCode = null;
    this.worksheetComponent.agGrid.api.refreshCells();
    let body: WorksheetEvent = {rowUpdateEvents: updateData, worksheet: this.selectedWorksheet};
    this.worksheetService.updateRows(body).subscribe(response => {
      if (!response.error) {
        this.worksheetComponent.generateUnmodifiedFundingLines();
        this.reasonCodeComponent.ngOnInit();
        Notify.success('Worksheet updated successfully');
      } else {
        Notify.error('Something went wrong while trying to update the worksheet');
        console.log(response.error);
      }
    });
  }

}
