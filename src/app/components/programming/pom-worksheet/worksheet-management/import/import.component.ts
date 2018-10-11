import {Component, EventEmitter, Output} from '@angular/core';
import {Worksheet, WorksheetService} from "../../../../../generated";
import {StateService} from "../state.service";
import {OperationBase} from "../operartion.base";

@Component({
  selector: 'import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OperationBase {
  @Output() operationOver = new EventEmitter();
  selectedImportableWorksheet: Worksheet;
  importableWorksheets: Worksheet[];

  constructor( private stateService: StateService,
               private worksheetService: WorksheetService ) {}

  init() {
    this.importableWorksheets = this.stateService.worksheets.filter(worksheet => worksheet.locked);
    this.selectedImportableWorksheet = this.importableWorksheets[0] ? this.importableWorksheets[0] : null;
  }

  async onSave() {
    await this.worksheetService.update({...this.selectedImportableWorksheet, locked:false}).toPromise();
    this.operationOver.emit();
  }

}
