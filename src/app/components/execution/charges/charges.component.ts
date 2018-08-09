import { Component, OnInit, ViewChild } from '@angular/core'
import * as $ from 'jquery'

// Other Components
import { HeaderComponent } from '../../../components/header/header.component'
import { PBService } from '../../../generated/api/pB.service'
import { MyDetailsService } from '../../../generated/api/myDetails.service'
import { ExecutionService } from '../../../generated/api/execution.service'
import { ExecutionEvent } from '../../../generated/model/executionEvent'
import { PB } from '../../../generated/model/pB'
import { Execution } from '../../../generated/model/execution'
import { Router, ActivatedRoute, UrlSegment } from '@angular/router'
import { ExecutionLine, ProgramsService, ExecutionDropDown, ExecutionEventData } from '../../../generated';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ExecutionLineWrapper } from '../model/execution-line-wrapper';

@Component({
  selector: 'charges',
  templateUrl: './charges.component.html',
  styleUrls: ['./charges.component.scss']
})
export class ChargesComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  private updatelines: ExecutionLineWrapper[] = [];
  private phase: Execution;
  private reason: string;
  private other: string;
  private types: Map<string, string> = new Map<string, string>();
  private allsubtypes: ExecutionDropDown[];
  private subtypes: ExecutionDropDown[];
  private etype: ExecutionDropDown;
  private type: string;
  
  constructor(private exesvc: ExecutionService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(data => {
      forkJoin([
        this.exesvc.getById(data.phaseId),
        this.exesvc.getExecutionDropdowns()
      ]).subscribe(d2 => {
        this.phase = d2[0].result;

        this.types.set('EXE_APPROPRIATION_ACTION', 'Appropriation Action');
        this.types.set('EXE_CONGRESSIONAL_ACTION', 'Congressional Action');
        this.types.set('EXE_OUSDC_ACTION', 'OUSD(c) Action');
        this.allsubtypes = d2[1].result.filter(x => this.types.has(x.type));

        this.type = 'EXE_APPROPRIATION_ACTION';
        this.updatedropdowns();
      });
    });
  }

  submit() {
    var et: ExecutionEventData = {
      toIdAmtLkp: {},
      type: this.etype.subtype,
      other: this.other,
      reason: this.reason
    };
    this.updatelines.forEach(l => {
      et.toIdAmtLkp[l.line.id] = l.amt;
    });

    this.exesvc.createExecutionEvent(this.phase.id, new Blob(["stuff"]),
      new Blob([JSON.stringify(et)])).subscribe();
  }

  updatedropdowns() {
    this.subtypes = this.allsubtypes.filter(x => (x.type == this.type));
    this.etype = this.subtypes[0];
  }
}
