import {Component, EventEmitter, OnChanges, Output} from '@angular/core';
import {WorksheetService} from "../../../../../generated";
import {StateService} from "../state.service";
import {OperationBase} from "../operartion.base";

@Component({
  selector: 'rename',
  templateUrl: './rename.component.html',
  styleUrls: ['./rename.component.scss']
})
export class RenameComponent extends OperationBase {
  editableName: string;

  constructor( stateService: StateService, private worksheetService: WorksheetService ) {super(stateService);}

  init() {
    this.editableName = this.name;
  }

  async onSave() {
    await this.worksheetService.update({...this.stateService.selectedWorksheet, name:this.editableName}).toPromise();
    this.operationOver.emit();
  }

}
