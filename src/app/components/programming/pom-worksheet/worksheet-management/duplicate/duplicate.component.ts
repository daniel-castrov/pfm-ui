import {Component, EventEmitter, Output} from '@angular/core';
import {WorksheetService} from "../../../../../generated";
import {StateService} from "../state.service";
import {OperationBase} from "../operartion.base";

@Component({
  selector: 'duplicate',
  templateUrl: './duplicate.component.html',
  styleUrls: ['./duplicate.component.scss']
})
export class DuplicateComponent extends OperationBase {
  constructor( stateService: StateService, private worksheetService: WorksheetService ) {super(stateService);}

  init() {}

  async onSave() {
    await this.worksheetService.create({...this.stateService.selectedWorksheet, id:null}).toPromise();
    this.operationOver.emit();
  }

}
