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
  file: File;

  constructor( private stateService: StateService,
               private worksheetService: WorksheetService ) {}

  init() {
    this.file = null;
    this.importableWorksheets = this.stateService.worksheets.filter(worksheet => worksheet.locked);
    this.selectedImportableWorksheet = this.importableWorksheets[0] ? this.importableWorksheets[0] : null;
  }

  async onImport() {
    // await this.worksheetService.import1(this.selectedImportableWorksheet.id, this.file).toPromise();
    await this.worksheetService.update({...this.selectedImportableWorksheet, locked:false}).toPromise();
    this.operationOver.emit();
  }

  onFileChange(event){
    if (event.target.files && event.target.files.length > 0) {
      this.file = event.target.files[0] as File;
    }
  }

}
