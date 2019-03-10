import {Component, OnInit, ViewChild} from '@angular/core'
import {ExecutionService} from '../../../generated/api/execution.service'
import {Execution} from '../../../generated/model/execution'
import {ExecutionDropDown, ExecutionEventData} from '../../../generated';
import {ActivatedRoute, Router} from '@angular/router'
import {forkJoin} from 'rxjs/observable/forkJoin';
import {ExecutionLineWrapper} from '../model/execution-line-wrapper';
import {ExecutionTableValidator} from '../model/execution-table-validator';
import {ExecutionLineTableComponent} from '../execution-line-table/execution-line-table.component';

@Component({
  selector: 'charges',
  templateUrl: './charges.component.html',
  styleUrls: ['./charges.component.scss']
})
export class ChargesComponent implements OnInit {
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
  private hasAppropriation: boolean = false;

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
        this.exesvc.hasAppropriation(data.phaseId),
        this.exesvc.getById(data.phaseId),
        this.exesvc.getExecutionDropdowns(),
        this.exesvc.getExecutionLinesByPhase(data.phaseId)
      ]).subscribe(d2 => {
        this.phase = d2[1].result;
        this.hasAppropriation = d2[0].result;
        if (this.hasAppropriation) {
          this.types.set('EXE_OUSDC_ACTION', 'OUSD(C) Action');
        } else {
          this.types.set('EXE_APPROPRIATION_ACTION', 'Appropriation Action');
        }
        this.types.set('EXE_CONGRESSIONAL_ACTION', 'Congressional Action');
        this.allsubtypes = d2[2].result.filter(x => this.types.has(x.type));

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
    if (this.type === 'EXE_CONGRESSIONAL_ACTION'){
      if (this.hasAppropriation) {
        if (this.phase.status === 'OPEN') {
          this.subtypes = this.subtypes.filter(st => st.subtype !== 'CRA_CONGRESSIONAL_DIRECTED_TRANSGER')
        } else {
          this.subtypes = this.subtypes.filter(st => st.subtype === 'CRA_CONGRESSIONAL_RESCISSION')
        }
      } else {
        if (this.phase.status === 'OPEN') {
          this.subtypes = this.subtypes.filter(st => st.subtype !== 'CRA_CONGRESSIONAL_RESCISSION')
        } else {
          this.subtypes = this.subtypes.filter(st => st.subtype === 'CRA_CONGRESSIONAL_DIRECTED_TRANSGER')
        }
      }
    }
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
