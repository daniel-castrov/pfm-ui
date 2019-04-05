import {Component, Input} from '@angular/core';
import { Worksheet, WorksheetEvent, Workspace, WorkspaceService } from "../../../../generated";
import {Notify} from "../../../../utils/Notify";
import {RowUpdateEventData} from "../../../../generated/model/rowUpdateEventData";
import {WorksheetComponent} from "./../worksheet/worksheet.component";
import {ReasonCodeComponent} from "./../reason-code/reason-code.component";
import {RowNode} from "ag-grid";
import { WorkspaceComponent } from '../workspace/workspace.component';
import { GridToaComponent } from '../grid-toa/grid-toa.component';


@Component({
  selector: 'update-button',
  templateUrl: './update-button.component.html',
  styleUrls: ['./update-button.component.scss'],
})
export class UpdateButtonComponent {

  @Input() private gridToaComponent: GridToaComponent;
  @Input() private workspaceComponent: WorkspaceComponent;
  @Input() private reasonCodeComponent: ReasonCodeComponent;
  @Input() selectedWorksheet: Worksheet;
  @Input() selectedWorkspace: Workspace;

  constructor( private workspaceService: WorkspaceService ) {}

  update() {
    let modifiedRows: RowNode [] = this.workspaceComponent.agGrid.api.getSelectedNodes();
    if (modifiedRows.length === 0) {
      Notify.error('No changes detected.')
      return;
    }

    if(!this.reasonCodeComponent.reasonCode) {
      Notify.error('You must select or create a reason code.');
      return;
    }

    let updateData: RowUpdateEventData [] = [];
    this.workspaceComponent.agGrid.api.getSelectedNodes().forEach(node => {
      let modifiedRow: RowUpdateEventData = {};
      modifiedRow.notes = node.data.notes;
      modifiedRow.newFundingLine = node.data.fundingLine;
      modifiedRow.previousFundingLine = this.workspaceComponent.unmodifiedFundingLines.find(ufl =>
        ufl.fundingLine.id === node.data.fundingLine.id).fundingLine;
      modifiedRow.reasonCode = this.reasonCodeComponent.reasonCode;
      modifiedRow.worksheetId = this.workspaceComponent.selectedWorkspace.id;
      modifiedRow.programId = node.data.programId
      modifiedRow.fundingLineId = node.data.fundingLine.id;
      updateData.push(modifiedRow);

      console.log(modifiedRow);

      node.data.modified = false;
      node.setSelected(false);
      node.data.notes = '';
    });
    this.reasonCodeComponent.reasonCode = null;
    this.workspaceComponent.agGrid.api.refreshCells();
    let body: WorksheetEvent = {rowUpdateEvents: updateData, worksheet: this.selectedWorkspace};
    this.workspaceService.updateEvents(this.workspaceComponent.selectedWorkspace.id, updateData).subscribe(response => { 
      if (!response.error) {
        this.workspaceComponent.initDataRows();
        this.reasonCodeComponent.ngOnInit();
        this.gridToaComponent.initToaDataRows();
        Notify.success('Workspace updated successfully');
      } else {
        Notify.error('Something went wrong while trying to update the workspace');
        console.log(response.error);
      }
    });
  }

}
