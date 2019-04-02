import {Component, EventEmitter, Output} from '@angular/core';
import {RestResult, WorksheetService, WorkspaceService, Workspace} from "../../../../../generated";
import {Notify} from "../../../../../utils/Notify";
import { IOperation } from '../operation.interface';
import { WorkspaceStateService } from '../workspace-state.service';

@Component({
  selector: 'importer',
  templateUrl: './importer.component.html',
  styleUrls: ['./importer.component.scss']
})
export class ImporterComponent extends IOperation {
  selectedImportableWorkspace: Workspace;
  importableWorkspaces: Workspace[];
  file: File;

  constructor( stateService: WorkspaceStateService, private workspaceService: WorksheetService ) {super(stateService);}

  init() {
    this.importableWorkspaces = this.stateService.workspaces.filter(workspace => workspace.locked);
    this.selectedImportableWorkspace = this.importableWorkspaces[0] ? this.importableWorkspaces[0] : null;
  }

  async onImport() {
    const restResult = await this.workspaceService.import1(this.selectedImportableWorkspace.id, this.file).toPromise() as RestResult;
    if(restResult.error) {
      Notify.error('Import failed. Reason: ' + restResult.error);
    } else {
      Notify.success('Import successful');
      this.operationOver.emit();
    }
  }

  onFileChange(event){
    if (event.target.files && event.target.files.length > 0) {
      this.file = event.target.files[0] as File;
    }
  }

}
