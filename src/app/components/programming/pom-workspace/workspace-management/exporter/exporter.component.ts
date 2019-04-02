import {Component, EventEmitter, Output} from '@angular/core';
import {WorkspaceService, WorksheetService} from "../../../../../generated";
import {saveAs} from "file-saver";
import { WorkspaceStateService } from '../workspace-state.service';
import { IOperation } from '../operation.interface';

@Component({
  selector: 'exporter',
  templateUrl: './exporter.component.html',
  styleUrls: ['./exporter.component.scss']
})
export class ExporterComponent extends IOperation {
  constructor( stateService: WorkspaceStateService, private workspaceService: WorksheetService ) {super(stateService);}

  init() {}

  async onExport() {
    const xlsBlob = await this.workspaceService.export1(this.stateService.selectedWorkspace.id).toPromise();
    saveAs(xlsBlob, this.stateService.selectedWorkspace.name + ' ' + '1'/* this.stateService.selectedWorkspace.version */);
    this.operationOver.emit();
  }

}
