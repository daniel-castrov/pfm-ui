import {Component, EventEmitter, OnChanges, Output} from '@angular/core';
import {WorksheetService} from "../../../../../generated";
import {StateService} from "../state.service";
import {OperationBase} from "../operartion.base";

@Component({
  selector: 'rename',
  templateUrl: './rename.component.html',
  styleUrls: ['./rename.component.scss']
})
export class RenameComponent implements OperationBase {
  @Output() operationOver = new EventEmitter();
  name: string;
  version: number;
  editableName: string;

  constructor( private stateService: StateService,
               private worksheetService: WorksheetService ) {}

  init() {
    this.name = this.stateService.selectedWorksheet && this.stateService.selectedWorksheet.name;
    this.version = this.stateService.selectedWorksheet && this.stateService.selectedWorksheet.version;
    this.editableName = this.name;
  }

  async onSave() {
    await this.worksheetService.update({...this.stateService.selectedWorksheet, name:this.editableName}).toPromise();
    this.operationOver.emit();
  }

}
