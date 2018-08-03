import { Component, OnInit, ViewChild } from '@angular/core'
import * as $ from 'jquery'

// Other Components
import { HeaderComponent } from '../../../components/header/header.component'
import { PBService } from '../../../generated/api/pB.service'
import { MyDetailsService } from '../../../generated/api/myDetails.service'
import { ExecutionService } from '../../../generated/api/execution.service'
import { ExecutionTransfer } from '../../../generated/model/executionTransfer'
import { PB } from '../../../generated/model/pB'
import { Execution } from '../../../generated/model/execution'
import { Router, ActivatedRoute, UrlSegment } from '@angular/router'
import { ExecutionLine, ProgramsService, ExecutionDropDown } from '../../../generated';
import { forkJoin } from 'rxjs/observable/forkJoin';

@Component({
  selector: 'update-program-execution',
  templateUrl: './update-program-execution.component.html',
  styleUrls: ['./update-program-execution.component.scss']
})
export class UpdateProgramExecutionComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private current: ExecutionLine;
  private phase: Execution;
  private updateexelines: ExecutionLine[] = [];
  private programIdNameLkp: Map<string, string> = new Map<string, string>();

  private types: Map<string, string> = new Map<string, string>();
  private allsubtypes: ExecutionDropDown[];
  private subtypes: ExecutionDropDown[];
  private etype: ExecutionDropDown;
  private type: string;
  private fromIsSource: boolean = false;

  private reason: string;

  constructor(private exesvc: ExecutionService, private progsvc: ProgramsService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    var my: UpdateProgramExecutionComponent = this;
    this.route.url.subscribe((segments: UrlSegment[]) => {
      var exelineid = segments[segments.length - 1].path;

      forkJoin([
        my.exesvc.getExecutionLineById(exelineid),
        my.progsvc.getIdNameMap(),
        my.exesvc.getExecutionDropdowns()
      ]).subscribe(data => {
        my.current = data[0].result;

        my.exesvc.getExecutionLinesByPhase(my.current.phaseId).subscribe(d2 => {
          my.allexelines = d2.result;
        });
        my.exesvc.getById(my.current.phaseId).subscribe(d2 => {
          my.phase = d2.result;
        });

        Object.getOwnPropertyNames(data[1].result).forEach(id => {
          my.programIdNameLkp.set(id, data[1].result[id]);
        });

        this.types.set('EXE_BTR', 'BTR');
        this.types.set('EXE_REALIGNMENT', 'Realignment');
        this.types.set('EXE_REDISTRIBUTION', 'Redistribution');
        this.allsubtypes = data[2].result.filter(x => this.types.has(x.type));

        this.type = 'EXE_BTR';
        this.updatedropdowns();
      });
    });
  }

  submit() {
    var et: ExecutionTransfer = {
      fromId: this.current.id,
      fromIsSource: this.fromIsSource,
      toIdAmtLkp: {},
      type: this.etype.subtype,
      reason: this.reason,
    };
    this.updateexelines.forEach(l => {
      et.toIdAmtLkp[l.id] = l.released; // FIXME: this is just a placeholder
    });

    this.exesvc.createExecutionEvent(this.phase.id, new Blob(["stuff"]),
      new Blob([JSON.stringify(et)])).subscribe();
  }

  fullname(exeline: ExecutionLine): string {
    if (this.programIdNameLkp && exeline) {
      return this.programIdNameLkp.get(exeline.mrId);
    }
    else {
      return '';
    }
  }

  updatedropdowns() {
    this.subtypes = this.allsubtypes.filter(x => (x.type == this.type));
    this.etype = this.subtypes[0];
  }
}
