import { Component, OnInit, ViewChild } from '@angular/core'
import * as $ from 'jquery'

// Other Components
import { HeaderComponent } from '../../header/header.component'
import { PBService } from '../../../generated/api/pB.service'
import { MyDetailsService } from '../../../generated/api/myDetails.service'
import { ExecutionService } from '../../../generated/api/execution.service'
import { ExecutionEvent } from '../../../generated/model/executionEvent'
import { PB } from '../../../generated/model/pB'
import { Execution } from '../../../generated/model/execution'
import { ExecutionLine, ProgramsService, ExecutionDropDown, ExecutionEventData } from '../../../generated';
import { Router, ActivatedRoute, UrlSegment, Route } from '@angular/router'
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ExecutionLineWrapper } from '../model/execution-line-wrapper';
import { ExecutionTableValidator } from '../model/execution-table-validator';
import { ExecutionLineTableComponent } from '../execution-line-table/execution-line-table.component';

@Component({
  selector: 'charges',
  templateUrl: './charges.component.html',
  styleUrls: ['./charges.component.scss']
})
export class ChargesComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @ViewChild(ExecutionLineTableComponent) table;

  private updatelines: ExecutionLineWrapper[] = [];
  private phase: Execution;
  private reason: string;
  private other: string;
  private types: Map<string, string> = new Map<string, string>();
  private allsubtypes: ExecutionDropDown[];
  private subtypes: ExecutionDropDown[];
  private etype: ExecutionDropDown;
  private type: string;
  private showotherN: boolean = true;
  private showotherT: boolean = true;
  private fileid: string;
  private isUploading: boolean;
  private validator: ExecutionTableValidator = function (x: ExecutionLineWrapper[], totalamt: boolean): boolean[] {
    var okays: boolean[] = [];
    x.forEach(elw => {
      okays.push(elw.amt != 0 && elw.line && elw.line.released
        ? elw.amt <= elw.line.released
        : true);
    });
    return okays;
  };

  constructor(private exesvc: ExecutionService, private route: ActivatedRoute,
    private router: Router ) { }

  ngOnInit() {
    this.route.params.subscribe(data => {
      forkJoin([
        this.exesvc.getById(data.phaseId),
        this.exesvc.getExecutionDropdowns(),
        this.exesvc.getExecutionLinesByPhase(data.phaseId)
      ]).subscribe(d2 => {
        this.phase = d2[0].result;
        if (!d2[2].result.some(el => !el.appropriated)) {
          this.types.set('EXE_OUSDC_ACTION', 'OUSD(C) Action');
        } else {
          this.types.set('EXE_APPROPRIATION_ACTION', 'Appropriation Action');
        }
        this.types.set('EXE_CONGRESSIONAL_ACTION', 'Congressional Action');
        this.allsubtypes = d2[1].result.filter(x => this.types.has(x.type));

        this.type = 'EXE_CONGRESSIONAL_ACTION';
        this.updatedropdowns();
      });
    });
  }

  submit() {
    var et: ExecutionEventData = {
      toIdAmtLkp: {},
      type: this.etype.subtype,
      reason: this.reason
    };

    if ('EXE_CONGRESSIONAL_ACTION' !== this.etype.type) {
      et.other = this.other;
    }

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

  updatedropdowns() {
    this.subtypes = this.allsubtypes.filter(x => (x.type == this.type));
    this.etype = this.subtypes[0];
    this.updatedropdowns2();
  }

  updatedropdowns2() {
    if ('EXE_CONGRESSIONAL_ACTION' === this.etype.type) {
      this.showotherN = false;
      this.showotherT = false;
    }
    else if ('EXE_OUSDC_ACTION' === this.etype.type) {
      this.showotherN = false;
      this.showotherT = true;
    }
    else { // EXE_APPROPRIATION_ACTION
      // appropriation action is sometimes an N and sometimes a T
      this.showotherN = (this.etype.subtype === 'APPR_SECTION' || this.etype.subtype === 'APPR_FFRDC');
      this.showotherT = !this.showotherN;

      if (!this.other) {
        this.other = '1';
      }
    }
  }

  onUploading(event) {
    this.isUploading = event;
  }

  onFileUploaded(event) {
    this.fileid = event.id;
  }
}
