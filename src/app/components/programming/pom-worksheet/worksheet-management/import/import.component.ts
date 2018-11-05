import {Component, EventEmitter, Output} from '@angular/core';
import {Worksheet, WorksheetService} from "../../../../../generated";
import {StateService} from "../state.service";
import {OperationBase} from "../operartion.base";
import {Notify} from "../../../../../utils/Notify";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent extends OperationBase {
  selectedImportableWorksheet: Worksheet;
  importableWorksheets: Worksheet[];
  file: File;

  constructor( stateService: StateService, private worksheetService: WorksheetService ) {super(stateService);}

  init() {
    this.importableWorksheets = this.stateService.worksheets.filter(worksheet => worksheet.locked);
    this.selectedImportableWorksheet = this.importableWorksheets[0] ? this.importableWorksheets[0] : null;
  }

  async onImport() {
    try {
      await this.worksheetService.import1(this.selectedImportableWorksheet.id, this.file).toPromise();
      Notify.success('Import successful');
      this.operationOver.emit();
    } catch (ex) {
      const e = ex as HttpErrorResponse;
      Notify.error('Import failed. Reason: ' + e.error.error);
    }
  }

  onFileChange(event){
    if (event.target.files && event.target.files.length > 0) {
      this.file = event.target.files[0] as File;
    }
  }

}
