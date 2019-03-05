import { Component } from '@angular/core';
import { AgRendererComponent, ICellRendererAngularComp } from 'ag-grid-angular';
import { ExecutionEvent, ExecutionEventData, ExecutionLine, ExecutionService } from '../../../generated';
import { ExecutionLineWrapper } from '../model/execution-line-wrapper';

@Component({
  selector: 'app-transfer-from-to-details-cell-renderer',
  templateUrl: './transfer-from-to-details-cell-renderer.component.html',
  styleUrls: ['./transfer-from-to-details-cell-renderer.component.scss']
})

export class TransferFromToDetailsCellRendererComponent implements ICellRendererAngularComp {
  private params;
  private istransfer: boolean = false;
  private issrc: boolean;
  private programIdNameLkp: Map<string, string>;
  private otherel: string;

  constructor( private exesvc:ExecutionService) {
  }

  agInit(param) {
    this.params = param;

    var event: ExecutionEvent = param.data.event;
    var eventdata: ExecutionEventData = event.value;

    this.istransfer = ('EXE_BTR' === event.eventType ||
      'EXE_REDISTRIBUTION' === event.eventType ||
      'EXE_REALIGNMENT' === event.eventType ||
      'EXE_FM_DIRECTED_ALIGNMENT' === event.eventType);

    if (param.context.line) {
      this.programIdNameLkp = param.context.programIdNameLkp;

      var current: ExecutionLine = param.context.line;

      if (this.istransfer) {
        if (eventdata.fromId === current.id) {
          this.issrc = eventdata.fromIsSource;
          this.setOtherEl(Object.getOwnPropertyNames(eventdata.toIdAmtLkp)[0]);
        }
        else {
          this.issrc = !eventdata.fromIsSource;
          this.setOtherEl(eventdata.fromId );
        }
      }
    }
    else {
      this.issrc = false;
    }
  }

  refresh(): boolean {
    return true;
  }

  setOtherEl(otherElId) {
    var my: TransferFromToDetailsCellRendererComponent = this;
    this.exesvc.getExecutionLineById(otherElId).subscribe(d => {
      var line: ExecutionLine = d.result;
      my.otherel = line.programName + ': ' + line.appropriation
        + '/' + line.blin + '/' + line.item + '/' + line.opAgency;
    });
  }
}
