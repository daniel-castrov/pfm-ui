import {Component, EventEmitter, Output} from '@angular/core';
import {WorkspaceService} from "../../../../../generated";
import { IOperation } from '../operation.interface';
import { WorkspaceStateService } from '../workspace-state.service';

@Component({
  selector: 'duplicater',
  templateUrl: './duplicater.component.html',
  styleUrls: ['./duplicater.component.scss']
})
export class DuplicaterComponent extends IOperation {
  constructor( stateService: WorkspaceStateService, private workspaceService: WorkspaceService ) {super(stateService);}

  init() {}

  async onSave() {
    await this.workspaceService.duplicate(this.stateService.selectedWorkspace.id).toPromise();
    this.operationOver.emit();
  }

}
