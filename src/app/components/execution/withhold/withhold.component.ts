import {Component, OnInit, ViewChild} from '@angular/core';
import {ExecutionService} from '../../../generated/api/execution.service';
import {Execution} from '../../../generated/model/execution';
import {ActivatedRoute, Router} from '@angular/router';
import {ExecutionDropDown, ExecutionEventData, ExecutionLine} from '../../../generated';
import {ExecutionLineWrapper} from '../model/execution-line-wrapper';
import {ExecutionLineFilter} from '../model/execution-line-filter';
import {ExecutionLineTableComponent} from '../execution-line-table/execution-line-table.component';
import {ExecutionTableValidator} from '../model/execution-table-validator';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'withhold',
  templateUrl: './withhold.component.html',
  styleUrls: ['./withhold.component.scss']
})
export class WithholdComponent implements OnInit {

  @ViewChild(ExecutionLineTableComponent) table;
  private updatelines: ExecutionLineWrapper[] = [];
  private phase: Execution;
  private reason: string;
  private etype: ExecutionDropDown;
  private other: string;
  private isUploading = false;
  private subtypes: ExecutionDropDown[];
  private fileid: string;
  private linefilter: ExecutionLineFilter = function (x: ExecutionLine): boolean {
    return ( x.released > 0 );
  };
  private validator: ExecutionTableValidator = (x: ExecutionLineWrapper[], totalamt: boolean): boolean[] => {
    const okays: boolean[] = [];
    const positiveImpact: boolean[] = [];
    x.forEach(elw => {
      if (elw.line.programName !== 'totals-row') {
        this.etype.impact.forEach(v => {
          if (v === 'TOA') {
            const result = elw.line.toa + elw.amt;
            positiveImpact.push(result >= 0);
          }
          if (v === 'RELEASED') {
            const result = elw.line.released - elw.amt;
            positiveImpact.push(result >= 0);
          }
          if (v === 'WITHHOLD') {
            const result = elw.line.withheld + elw.amt;
            positiveImpact.push(result >= 0);
          }
        });
        okays.push(elw.amt !== 0 && elw.line
          ? !positiveImpact.some(v => v === false)
          : true);
      }
    });
    return okays;
  }

  constructor(private exesvc: ExecutionService, private route: ActivatedRoute,
    private router: Router ) { }

  ngOnInit() {
    this.route.params.subscribe(data => {
      forkJoin([
        this.exesvc.getById(data.phaseId),
        this.exesvc.getExecutionDropdowns()
      ]).subscribe(d2 => {
        this.phase = d2[0].result;
        this.subtypes = d2[1].result.filter(x => ('EXE_WITHHOLD' === x.type));
        this.etype = this.subtypes[0];
      });
    });
  }

  submit() {
    var et: ExecutionEventData = {
      toIdAmtLkp: {},
      type: this.etype.subtype,
      other: this.other,
      reason: this.reason,
    };
    this.table.updatelines.forEach(l => {
      et.toIdAmtLkp[l.line.id] = l.amt;
    });

    if (this.fileid) {
      et.fileId = this.fileid;
    }

    this.exesvc.createExecutionEvent(this.phase.id, et).subscribe(d => {
        this.router.navigate(['/funds-update']);
      });
  }

  onUploading(event) {
    this.isUploading = event;
  }

  onFileUploaded(event) {
    this.fileid = event.id;
  }
}
