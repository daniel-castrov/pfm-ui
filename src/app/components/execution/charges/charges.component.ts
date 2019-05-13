import {Component, OnInit, ViewChild} from '@angular/core';
import {ExecutionService} from '../../../generated/api/execution.service';
import {Execution} from '../../../generated/model/execution';
import {ExecutionDropDown, ExecutionEventData} from '../../../generated';
import {ActivatedRoute, Router} from '@angular/router';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
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
  private showotherN = true;
  private showotherT = true;
  private fileid: string;
  private isUploading: boolean;
  private hasAppropriation = false;

  private validator: ExecutionTableValidator = (x: ExecutionLineWrapper[], totalamt: boolean): boolean[] => {
    const okays: boolean[] = [];
    x.forEach(elw => {
        if (elw.line.programName !== 'totals-row') {
          let validInput = true;
          const positiveImpact: boolean[] = [];
          if (this.etype.inputValue === 'POSITIVE') {
            validInput = elw.amt >= 0;
          }
          if (this.etype.inputValue === 'NEGATIVE') {
            validInput = elw.amt <= 0;
          }
          this.etype.impact.forEach(v => {
            if (v === 'TOA') {
              const result = elw.line.toa + elw.amt;
              positiveImpact.push(result >= 0);
            }
            if (v === 'RELEASED') {
              const result = elw.line.released + elw.amt;
              positiveImpact.push(result >= 0);
            }
            if (v === 'WITHHOLD') {
              const result = elw.line.withheld + elw.amt;
              positiveImpact.push(result >= 0);
            }
          });
          okays.push(elw.amt !== 0 && elw.line
            ? validInput && !positiveImpact.some(v => v === false)
            : true);
        }
      }
    );
    return okays;
  }

  constructor(private exesvc: ExecutionService, private route: ActivatedRoute,
              private router: Router) {
  }

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
    const et: ExecutionEventData = {
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
    this.subtypes = this.allsubtypes.filter(x => (x.type === this.type));
    if (this.type === 'EXE_CONGRESSIONAL_ACTION') {
      if (!this.hasAppropriation) {
        this.subtypes = this.subtypes.filter(st => st.subtype !== 'CRA_CONGRESSIONAL_RESCISSION');
      }
    }
    this.etype = this.subtypes[0];
    this.updatedropdowns2();
  }

  updatedropdowns2() {
    if ('EXE_CONGRESSIONAL_ACTION' === this.etype.type) {
      this.other = undefined;
      this.showotherN = false;
      this.showotherT = false;
    } else if ('EXE_OUSDC_ACTION' === this.etype.type) {
      this.other = undefined;
      this.showotherN = false;
      this.showotherT = true;
    } else { // EXE_APPROPRIATION_ACTION
      // appropriation action is sometimes an N and sometimes a T

      this.showotherN = (this.etype.subtype === 'APPR_SECTION' || this.etype.subtype === 'APPR_FFRDC');
      this.showotherT = !this.showotherN;

      if (!this.other) {
        this.other = '1';
      } else {
        this.other = undefined;
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
