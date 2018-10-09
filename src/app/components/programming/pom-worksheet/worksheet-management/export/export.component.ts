import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Worksheet, WorksheetService} from "../../../../../generated";

@Component({
  selector: 'export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnChanges {
  @Input() selectedWorksheet: Worksheet;
  @Output() operationOver = new EventEmitter();

  constructor(private worksheetService: WorksheetService) {}

  name: string;
  version: number;

  ngOnChanges() {
    this.name = this.selectedWorksheet && this.selectedWorksheet.name;
    this.version = this.selectedWorksheet && this.selectedWorksheet.version;
  }

  onSave() {
    this.selectedWorksheet.locked = true;
    this.worksheetService.create(this.selectedWorksheet).subscribe();
  }
}
