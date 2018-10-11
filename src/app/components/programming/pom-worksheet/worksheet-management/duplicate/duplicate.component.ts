import {Component, EventEmitter, Output} from '@angular/core';
import {WorksheetService} from "../../../../../generated";
import {StateService} from "../state.service";
import {OperationBase} from "../operartion.base";

@Component({
  selector: 'duplicate',
  templateUrl: './duplicate.component.html',
  styleUrls: ['./duplicate.component.scss']
})
export class DuplicateComponent implements OperationBase {
  @Output() operationOver = new EventEmitter();
  name: string;
  version: number;

  constructor( private stateService: StateService,
               private worksheetService: WorksheetService ) {}

  init() {
    this.name = this.stateService.selectedWorksheet && this.stateService.selectedWorksheet.name;
    this.version = this.stateService.selectedWorksheet && this.stateService.selectedWorksheet.version;
  }

  async onSave() {
    await this.worksheetService.create({...this.stateService.selectedWorksheet, id:null}).toPromise();
    this.operationOver.emit();
  }

}
