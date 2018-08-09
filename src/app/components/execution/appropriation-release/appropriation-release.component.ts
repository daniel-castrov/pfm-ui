import { Component, OnInit, ViewChild } from '@angular/core';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../header/header.component';
import { PBService } from '../../../generated/api/pB.service'
import { MyDetailsService } from '../../../generated/api/myDetails.service'
import { ExecutionService } from '../../../generated/api/execution.service'
import { PB } from '../../../generated/model/pB'
import { Execution } from '../../../generated/model/execution';
import { Router, ActivatedRoute } from '@angular/router';
import { ExecutionLine, ExecutionTransfer, ExecutionDropDown } from '../../../generated';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ExecutionLineWrapper } from '../model/execution-line-wrapper';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'appropriation-release',
  templateUrl: './appropriation-release.component.html',
  styleUrls: ['./appropriation-release.component.scss']
})

export class AppropriationReleaseComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private updatelines: ExecutionLineWrapper[] = [];
  private phase: Execution;
  private reason: string;
  private etype: ExecutionDropDown;
  private other: string;
  private subtypes: ExecutionDropDown[];

  constructor(private exesvc: ExecutionService, private route: ActivatedRoute) { }

  ngOnInit() {
    
    this.route.params.subscribe(data => {
      forkJoin([
        this.exesvc.getById(data.phaseId),
        this.exesvc.getExecutionDropdowns()
      ]).subscribe(d2 => {
        this.phase = d2[0].result;
        this.subtypes = d2[1].result.filter(x => ('EXE_RELEASE' === x.type));
        this.etype = this.subtypes[0];
      });
    });
  }

  submit() {
    var et: ExecutionTransfer = {
      toIdAmtLkp: {},
      type: this.etype.subtype,
      other: this.other,
      reason: this.reason,
    };
    this.updatelines.forEach(l => {
      et.toIdAmtLkp[l.line.id] = l.amt;
    });

    this.exesvc.createExecutionEvent(this.phase.id, new Blob(["stuff"]),
      new Blob([JSON.stringify(et)])).subscribe();
  }

  updatetable() {
    if ('RELEASE_CRA' === this.etype.subtype) {
      this.updatelines = [];
    }
    else {
      this.exesvc.getExecutionLinesByPhase(this.phase.id).subscribe(data => {
        this.updatelines = [];
        data.result.forEach(x => { 
          this.updatelines.push({
            line: x,
            amt: x.toa - x.released
          });
        });

      });      
    }
  }
}
