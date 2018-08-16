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
    var my: TransferFromToDetailsCellRendererComponent = this;

    var event: ExecutionEvent = param.data.event;
    var eventdata: ExecutionEventData = event.value;

    this.istransfer = ('EXE_BTR' === event.eventType ||
      'EXE_REDISTRIBUTION' === event.eventType ||
      'EXE_REALIGNMENT' === event.eventType);
    
    if (param.context.line) {
      this.programIdNameLkp = param.context.programIdNameLkp;

      var current: ExecutionLine = param.context.line;

      if (this.istransfer) {
        //console.log('This is a transfer event');
        //console.log(current.id);
        //console.log(eventdata.fromIsSource + ' ' + eventdata.fromId);
        //console.log(eventdata.toIdAmtLkp);

        if (eventdata.fromIsSource && eventdata.fromId === current.id) {
          this.issrc = true;
          if (Object.getOwnPropertyNames(eventdata.toIdAmtLkp).length > 1) {
            this.otherel = 'multiple';
          }
          else {
            my.fetchOneOther(Object.getOwnPropertyNames(eventdata.toIdAmtLkp)[0]);
          }
        }
        else if (!eventdata.fromIsSource && eventdata.toIdAmtLkp[current.id]) {
          this.issrc = true;
          my.fetchOneOther(eventdata.fromId);
        }
        else {
          this.issrc = false;

          if (eventdata.fromId === current.id) {
            if (Object.getOwnPropertyNames(eventdata.toIdAmtLkp).length > 1) {
              this.otherel = 'multiple';
            }
            else {
              my.fetchOneOther(Object.getOwnPropertyNames(eventdata.toIdAmtLkp)[0]);
            }
          }
          else {
            if (Object.getOwnPropertyNames(eventdata.toIdAmtLkp).length > 1) {
              this.otherel = 'multiple';
            }
            else {
              my.fetchOneOther(Object.getOwnPropertyNames(eventdata.toIdAmtLkp)[0]);
            }            
          }
        }
      }
    }
    else {
      this.istransfer = false;
      this.issrc = false;
    }
  }

  refresh(): boolean {
    return true;
  }

  fetchOneOther(otherElId) {
    var my: TransferFromToDetailsCellRendererComponent = this;
    this.exesvc.getExecutionLineById(otherElId).subscribe(d => {
      var line: ExecutionLine = d.result;
      console.log(d.result);
      my.otherel = my.programIdNameLkp.get(line.mrId) + ': ' + line.appropriation
        + '/' + line.blin + '/' + line.item + '/' + line.opAgency;
    });
  }
}
