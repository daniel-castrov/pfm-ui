import {Component} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import {PhaseType} from "../../programming/select-program-request/UiProgrammaticRequest";
import {GridType} from "../../programming/program-request/funds-tab/GridType";
import {ProgramType} from "../../../generated";

@Component({
  selector: 'view-siblings-renderer',
  templateUrl: './view-siblings-renderer.component.html',
  styleUrls: ['./view-siblings-renderer.component.scss']
})
export class ViewSiblingsRenderer implements ICellRendererAngularComp {
  params;
  value;
  showButton: Boolean = false;
  constructor() {
  }

  agInit(param) {
    this.params = param;
    switch(param.data.phaseType) {
      case PhaseType.POM:
        this.value = param.data.phaseType + (param.context.parentComponent.pomFy - 2000);
        break;
      case PhaseType.PB:
        this.value = param.data.phaseType + (param.context.parentComponent.pbFy - 2000);
        break;
      case PhaseType.DELTA:
        this.value = param.data.phaseType;
        break;
    }

    if (param.data.phaseType === PhaseType.POM &&
        param.data.gridType === GridType.CURRENT_PR &&
        param.context.parentComponent.pr.type === ProgramType.GENERIC) {
      this.showButton = true;
    }
  }

  viewSiblings() {
    this.params.context.parentComponent.viewSiblings(this.params.data.fundingLine);
  }

  refresh(): boolean {
    return false;
  }
}
