import {Component} from '@angular/core';
import {Worksheet, WorksheetService} from "../../../../../generated";
import {StateService} from "../state.service";
import {OperationBase} from "../operartion.base";

@Component({
  selector: 'unlock',
  templateUrl: './unlock.component.html',
  styleUrls: ['./unlock.component.scss']
})
export class UnlockComponent extends OperationBase {
  selectedImportableWorksheet: Worksheet;
  importableWorksheets: Worksheet[];

  constructor( stateService: StateService, private worksheetService: WorksheetService ) {super(stateService);}

  init() {
    this.importableWorksheets = this.stateService.worksheets.filter(worksheet => worksheet.locked);
    this.selectedImportableWorksheet = this.importableWorksheets[0] ? this.importableWorksheets[0] : null;
  }

  async onUnlock() {
    await this.worksheetService.update({...this.selectedImportableWorksheet, locked: false}).toPromise();
    this.operationOver.emit();
  }

}
