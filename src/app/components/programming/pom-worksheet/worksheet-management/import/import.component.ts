import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Worksheet, WorksheetService} from "../../../../../generated";

@Component({
  selector: 'import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnChanges {
  @Input() worksheets: Worksheet[];
  @Output() operationOver = new EventEmitter();
  importableWorksheets: Worksheet[];
  selectedWorksheet: Worksheet;

  constructor( private worksheetService: WorksheetService ) {}

  ngOnChanges() {
    if(this.worksheets) {
      this.importableWorksheets = this.worksheets.filter(worksheet => worksheet.locked);
    }
  }

  async onSave() {
    this.selectedWorksheet.locked = false;
    await this.worksheetService.create(this.selectedWorksheet).toPromise();
    this.operationOver.emit();
  }

}
