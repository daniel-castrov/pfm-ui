import {Component} from '@angular/core';
import {Workspace, WorkspaceService} from "../../../../../generated";
import { WorkspaceStateService } from '../workspace-state.service';
import { IOperation } from '../operation.interface';

@Component({
  selector: 'unlocker',
  templateUrl: './unlocker.component.html',
  styleUrls: ['./unlocker.component.scss']
})
export class UnlockerComponent extends IOperation {
  selectedImportableWorkspace: Workspace;
  importableWorkspaces: Workspace[];

  constructor( stateService: WorkspaceStateService, private workspaceService: WorkspaceService ) {super(stateService);}

  init() {
    this.importableWorkspaces = this.stateService.workspaces.filter(workspace => workspace.locked);
    this.selectedImportableWorkspace = this.importableWorkspaces[0] ? this.importableWorkspaces[0] : null;
  }

  async onUnlock() {
    this.selectedImportableWorkspace.locked = false
    await this.workspaceService.update(this.selectedImportableWorkspace, this.selectedImportableWorkspace.id).toPromise();
    this.operationOver.emit();
  }

}
