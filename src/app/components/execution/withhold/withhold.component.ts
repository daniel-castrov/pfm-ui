import { Component, OnInit, ViewChild } from '@angular/core'
import * as $ from 'jquery'

// Other Components
import { HeaderComponent } from '../../header/header.component'
import { PBService } from '../../../generated/api/pB.service'
import { MyDetailsService } from '../../../generated/api/myDetails.service'
import { ExecutionService } from '../../../generated/api/execution.service'
import { ExecutionEvent } from '../../../generated/model/ExecutionEvent'
import { PB } from '../../../generated/model/pB'
import { Execution } from '../../../generated/model/execution'
import { Router, ActivatedRoute, UrlSegment } from '@angular/router'
import { ExecutionLine, ProgramsService, ExecutionDropDown, ExecutionEventData } from '../../../generated';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ExecutionLineWrapper } from '../model/execution-line-wrapper';
import { ExecutionLineFilter } from '../model/execution-line-filter';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'withhold',
  templateUrl: './withhold.component.html',
  styleUrls: ['./withhold.component.scss']
})
export class WithholdComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  private updatelines: ExecutionLineWrapper[] = [];
  private phase: Execution;
  private reason: string;
  private etype: ExecutionDropDown;
  private other: string;
  private longname: string;
  private subtypes: ExecutionDropDown[];
  private linefilter: ExecutionLineFilter = function (x: ExecutionLine): boolean {
    return ( x.released > 0 );
  };

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
    this.updatelines.forEach(l => {
      et.toIdAmtLkp[l.line.id] = l.amt;
    });

    this.exesvc.createExecutionEvent(this.phase.id, new Blob(["stuff"]),
      new Blob([JSON.stringify(et)])).subscribe(d => { 
        this.router.navigate(['/funds-update']);
      });
  }
}
