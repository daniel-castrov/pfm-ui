import {WorkspaceStateService} from "./workspace-state.service";
import {EventEmitter, Output} from "@angular/core";

export abstract class IOperation {
  @Output() operationOver = new EventEmitter();

  protected constructor( protected stateService: WorkspaceStateService ) {}

  abstract init();

  get name(): string {
    return this.stateService.selectedWorkspace && this.stateService.selectedWorkspace.name;
  }

  get version(): number {
    return this.stateService.selectedWorkspace && this.stateService.selectedWorkspace.version;
  }

}
