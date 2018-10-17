import {Component, EventEmitter, Output} from '@angular/core';
import {WorksheetService} from "../../../../../generated";
import {StateService} from "../state.service";
import {OperationBase} from "../operartion.base";
import {saveAs} from "file-saver";

@Component({
  selector: 'export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OperationBase {
  @Output() operationOver = new EventEmitter();
  name: string;
  version: number;

  constructor( private stateService: StateService,
               private worksheetService: WorksheetService) {}

  init() {
    this.name = this.stateService.selectedWorksheet && this.stateService.selectedWorksheet.name;
    this.version = this.stateService.selectedWorksheet && this.stateService.selectedWorksheet.version;
  }

  async onExport() {
    const xlsBlob = await this.worksheetService.export1(this.stateService.selectedWorksheet.id).toPromise();
    saveAs(xlsBlob, this.stateService.selectedWorksheet.name);
    this.operationOver.emit();
  }

}
