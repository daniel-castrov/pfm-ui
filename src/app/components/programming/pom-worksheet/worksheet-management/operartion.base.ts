import {StateService} from "./state.service";
import {EventEmitter, Output} from "@angular/core";

export abstract class OperationBase {
  @Output() operationOver = new EventEmitter();

  protected constructor( protected stateService: StateService ) {}

  abstract init();

  get name(): string {
    return this.stateService.selectedWorksheet && this.stateService.selectedWorksheet.name;
  }

  get version(): number {
    return this.stateService.selectedWorksheet && this.stateService.selectedWorksheet.version;
  }

}
