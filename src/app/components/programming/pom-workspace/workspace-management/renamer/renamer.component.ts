import {Component, EventEmitter, OnChanges, Output} from '@angular/core';
import {WorkspaceService} from "../../../../../generated";
import { IOperation } from '../operation.interface';
import { WorkspaceStateService } from '../workspace-state.service';

@Component({
  selector: 'renamer',
  templateUrl: './renamer.component.html',
  styleUrls: ['./renamer.component.scss']
})
export class RenamerComponent extends IOperation {
  editableName: string;

  constructor( stateService: WorkspaceStateService, private workspaceService: WorkspaceService ) {super(stateService);}

  init() {
    this.editableName = this.name;
  }

  async onSave() {
    this.stateService.selectedWorkspace.name = this.editableName
    await this.workspaceService.update(this.stateService.selectedWorkspace, this.stateService.selectedWorkspace.id).toPromise();
    this.operationOver.emit();
  }

}
