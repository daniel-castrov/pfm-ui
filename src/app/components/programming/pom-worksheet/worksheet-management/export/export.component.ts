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
export class ExportComponent extends OperationBase {
  constructor( stateService: StateService, private worksheetService: WorksheetService ) {super(stateService);}

  init() {}

  async onExport() {
    const xlsBlob = await this.worksheetService.export1(this.stateService.selectedWorksheet.id).toPromise();
    saveAs(xlsBlob, this.stateService.selectedWorksheet.name + ' ' + this.stateService.selectedWorksheet.version);
    this.operationOver.emit();
  }

}
