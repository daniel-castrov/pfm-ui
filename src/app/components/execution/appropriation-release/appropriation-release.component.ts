import { Component, OnInit, ViewChild } from '@angular/core';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../header/header.component';
import { ExecutionService } from '../../../generated/api/execution.service'
import { Execution } from '../../../generated/model/execution';
import { Router, ActivatedRoute } from '@angular/router';
import { ExecutionEventData, ExecutionDropDown, ExecutionLine } from '../../../generated';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ExecutionLineWrapper } from '../model/execution-line-wrapper';
import { ExecutionLineFilter } from '../model/execution-line-filter';
import { ExecutionLineTableComponent } from '../execution-line-table/execution-line-table.component';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'appropriation-release',
  templateUrl: './appropriation-release.component.html',
  styleUrls: ['./appropriation-release.component.scss']
})

export class AppropriationReleaseComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @ViewChild(ExecutionLineTableComponent) table;
  private updatelines: ExecutionLineWrapper[] = [];
  private phase: Execution;
  private reason: string;
  private etype: ExecutionDropDown;
  private other: string;
  private subtypes: ExecutionDropDown[];
  private progfilter: ExecutionLineFilter;
  private showAddProgramButton: boolean = false;
  private line: ExecutionLineFilter = function (el: ExecutionLine): boolean {
    return true;
  };

  constructor(private exesvc: ExecutionService, private route: ActivatedRoute,
    private router: Router) {}

  ngOnInit() {
    this.progfilter = function (exeline: ExecutionLine): boolean {
      return !(exeline.appropriated);
    };

    this.route.params.subscribe(data => {
      forkJoin([
        this.exesvc.getById(data.phaseId),
        this.exesvc.getExecutionDropdowns(),
        this.exesvc.hasAppropriation(data.phaseId)
      ]).subscribe(d2 => {
        this.phase = d2[0].result;
        this.subtypes = d2[1].result
          .filter(x => 'EXE_RELEASE' === x.type)
          .filter(x => ( d2[2].result ? 'RELEASE_CRA' !== x.subtype : true ) );
        this.etype = this.subtypes[0];
        this.updatetable();
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

    this.exesvc.createExecutionEvent(this.phase.id, new Blob(["stuff"]),
      new Blob([JSON.stringify(et)])).subscribe(d => {
        this.router.navigate(['/funds-update']);
      });
  }

  updatetable() {
    this.exesvc.getExecutionLinesByPhase(this.phase.id).subscribe(data => {
      this.updatelines = [];
      data.result.filter(z => this.progfilter(z) ).forEach(x => { 
        this.updatelines.push({
          line: x,
          amt: x.toa - x.withheld - x.released
        });
      });
    });
  }
}
