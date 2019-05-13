import {Component, OnInit, ViewChild} from '@angular/core';
import {ExecutionService} from '../../../generated/api/execution.service';
import {Execution} from '../../../generated/model/execution';
import {ActivatedRoute, Router, UrlSegment} from '@angular/router';
import {FormatterUtil} from '../../../utils/formatterUtil';
import {ExecutionDropDown, ExecutionEventData, ExecutionLine} from '../../../generated';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {ExecutionLineWrapper} from '../model/execution-line-wrapper';
import {ExecutionLineFilter} from '../model/execution-line-filter';
import {ExecutionLineTableComponent} from '../execution-line-table/execution-line-table.component';
import {ExecutionTableValidator} from '../model/execution-table-validator';
import StatusEnum = Execution.StatusEnum;

@Component({
  selector: 'update-program-execution',
  templateUrl: './update-program-execution.component.html',
  styleUrls: ['./update-program-execution.component.scss']
})
export class UpdateProgramExecutionComponent implements OnInit {
  @ViewChild(ExecutionLineTableComponent) table;
  private current: ExecutionLineWrapper = {line: {}};
  private phase: Execution;
  private updatelines: ExecutionLineWrapper[] = [];

  private types: Map<string, string> = new Map<string, string>();
  private allsubtypes: ExecutionDropDown[];
  private subtypes: ExecutionDropDown[];
  private etype: ExecutionDropDown;
  private type: string;
  private fromIsSource = true;
  private linefilter: ExecutionLineFilter;
  private programfilter: ExecutionLineFilter;
  private validator: ExecutionTableValidator;
  private reason: string;
  private showtaginput: boolean = false;
  private other: string;
  private isUploading: boolean;
  private fileid;

  constructor(private exesvc: ExecutionService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  changeFromIsSource(event) {
    this.fromIsSource = ('0: true' === event.target.value);
    this.table.setAvailablePrograms(this.fromIsSource);
    this.table.recheckValidity();
    this.table.clearGrid();
  }

  ngOnInit() {
    this.route.url.subscribe((segments: UrlSegment[]) => {
      const exelineid = segments[segments.length - 1].path;

      forkJoin([
        this.exesvc.getExecutionLineById(exelineid),
        this.exesvc.getExecutionDropdowns(),
      ]).subscribe(data => {
        this.current = {
          line: data[0].result
        };

        this.programfilter = (el: ExecutionLine) => {
          if (this.current.line.id !== el.id) {
            return (this.fromIsSource ? true : el.released > 0);
          }
          return false;
        };

        this.exesvc.getById(this.current.line.phaseId).subscribe(d2 => {
          this.phase = d2.result;
          this.exesvc.hasAppropriation(this.current.line.phaseId).subscribe(d => {
            if (this.phase.status === StatusEnum.CREATED) {
              this.types.set('EXE_FM_DIRECTED_ALIGNMENT', 'FM Directed Alignment');
            }
            if (this.current.line.released) {
              if (d.result) {
                // has appropriation, so only BTR and REALIGNMENTS are possible
                this.types.set('EXE_BTR', 'BTR');
              } else {
                this.types.set('EXE_REDISTRIBUTION', 'Redistribution');
              }
              this.types.set('EXE_REALIGNMENT', 'Realignment');
            }
            this.allsubtypes = data[1].result.filter(x => this.types.has(x.type));
            let first = true;
            this.types.forEach((val, key) => {
              if (first) {
                this.type = key;
                this.updatedropdowns();
              }
              first = false;
            });
          });
        });
      });
    });
  }

  currencyFormatter(x: number): string {
    const r: string = FormatterUtil.currencyFormatter(x, 2, false);
    return r;
  }

  submit() {
    const et: ExecutionEventData = {
      fromId: this.current.line.id,
      fromIsSource: this.fromIsSource,
      toIdAmtLkp: {},
      type: this.etype.subtype,
      reason: this.reason,
    };

    if ('BTR_UFR' === this.etype.subtype
      || 'BTR_OTHER' === this.etype.subtype
      || 'REALIGNMENT_UFR' === this.etype.subtype
      || 'REALIGNMENT_OTHER' === this.etype.subtype) {
      et.other = this.other;
    }


    this.table.updatelines.forEach(l => {
      et.toIdAmtLkp[l.line.id] = l.amt;
    });


    this.exesvc.createExecutionEvent(this.phase.id, et).subscribe(d => {
      this.router.navigate(['/funds-update']);
    });
  }

  updatedropdowns() {
    let validationAmount: number;
    this.subtypes = this.allsubtypes.filter(x => (x.type === this.type));
    if ('EXE_BTR' === this.type) {
      validationAmount = this.current.line.released;
      // BTR-- only between same PE
      this.linefilter = (x: ExecutionLine): boolean => {
        if (x.programElement === this.current.line.programElement) {
          return true;
        }
        return false;
      };
    } else if ('EXE_REALIGNMENT' === this.type) {
      validationAmount = this.current.line.released;
      if (!this.current.line.appropriated) {
        this.subtypes = this.subtypes.filter(st => st.subtype === 'REALIGNMENT_REALIGNMENT');
      }
      // realignment-- only between same blin as current
      this.linefilter = (x: ExecutionLine): boolean => {
        if (x.blin === this.current.line.blin) {
          return true;
        }
        return false;
      };
    } else if ('EXE_REDISTRIBUTION' === this.type) {
      validationAmount = this.current.line.released;
      // redistributions can do whatever
      this.linefilter = (x: ExecutionLine): boolean => {
        return true;
      };
    } else if ('EXE_FM_DIRECTED_ALIGNMENT' === this.type) {
      validationAmount = this.current.line.toa;
      this.linefilter = (x: ExecutionLine): boolean => {
        if (x.appropriation === 'PROC') {
          if (x.blin === this.current.line.blin) {
            return true;
          }
        } else {
          if (x.programElement === this.current.line.programElement) {
            return true;
          }
        }
        return false;
      };
    }
    this.etype = this.subtypes[0];
    this.validator = (x: ExecutionLineWrapper[], totalamt: boolean): boolean[] => {
      let total = 0;

      x.forEach(elw => {
        total += (elw.amt ? elw.amt : 0);
      });
      let validInput = true;
      if (this.etype.inputValue === 'POSITIVE') {
        validInput = total >= 0;
      }
      if (this.etype.inputValue === 'NEGATIVE') {
        validInput = total <= 0;
      }

      const okays: boolean[] = [];

      if (totalamt) {
        // check the total against all the rows
        x.forEach(elw => {
          if (this.fromIsSource) {
            okays.push(total <= validationAmount && validInput);
          } else {
            // our values are the source, so make sure they have enough money

            if (elw.amt && elw.line && 'undefined' !== typeof elw.line.released) {
              okays.push((elw.line.released !== 0 ? elw.amt <= elw.line.released : false) && validInput);
            } else {
              okays.push(validInput);
            }
          }
        });
      } else {
        // checking individual lines
        // check to make sure we have enough money to spread around
        x.forEach(elw => {
          if (this.fromIsSource) {
            // if fromIsSource, there's nothing to check
            okays.push(elw.amt <= validationAmount && validInput);
          } else {
            // if we're the source, make sure we have enough money
            if (elw.amt && elw.line && 'undefined' !== typeof elw.line.released) {
              okays.push((elw.line.released !== 0 ? elw.amt <= elw.line.released : false) && validInput);
            } else {
              okays.push(validInput);
            }
          }
        });
      }
      return okays;
    };

    this.updatelines = this.updatelines.filter(elw => this.linefilter(elw.line));
    this.updatedropdowns2();
  }

  updatedropdowns2() {
    this.other = undefined;
    this.showtaginput = ('BTR_UFR' === this.etype.subtype
      || 'BTR_OTHER' === this.etype.subtype
      || 'REALIGNMENT_UFR' === this.etype.subtype
      || 'REALIGNMENT_OTHER' === this.etype.subtype);
  }

  onUploading(event) {
    this.isUploading = event;
  }

  onFileUploaded(event) {
    this.fileid = event.id;
  }
}
