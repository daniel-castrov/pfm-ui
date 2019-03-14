import {Component, OnInit, ViewChild} from '@angular/core';
import {ExecutionService} from '../../../generated/api/execution.service';
import {Execution} from '../../../generated/model/execution';
import {ActivatedRoute, Router, UrlSegment} from '@angular/router';
import {FormatterUtil} from '../../../utils/formatterUtil';
import {ExecutionDropDown, ExecutionEventData, ExecutionLine, ProgramsService} from '../../../generated';
import {forkJoin} from 'rxjs/observable/forkJoin';
import {ExecutionLineWrapper} from '../model/execution-line-wrapper';
import {ExecutionLineFilter} from '../model/execution-line-filter';
import {ExecutionLineTableComponent} from '../execution-line-table/execution-line-table.component';
import {ExecutionTableValidator} from '../model/execution-table-validator';

@Component({
  selector: 'update-program-execution',
  templateUrl: './update-program-execution.component.html',
  styleUrls: ['./update-program-execution.component.scss']
})
export class UpdateProgramExecutionComponent implements OnInit {
  @ViewChild(ExecutionLineTableComponent) table;
  private current: ExecutionLineWrapper = { line: {} };
  private phase: Execution;
  private updatelines: ExecutionLineWrapper[] = [];

  private types: Map<string, string> = new Map<string, string>();
  private allsubtypes: ExecutionDropDown[];
  private subtypes: ExecutionDropDown[];
  private etype: ExecutionDropDown;
  private type: string;
  private fromIsSource: boolean = true;
  private linefilter: ExecutionLineFilter;
  private programfilter: ExecutionLineFilter;
  private validator: ExecutionTableValidator;
  private reason: string;
  private showtaginput: boolean = false;
  private other: string;
  private isUploading: boolean;
  private fileid;

  constructor(private exesvc: ExecutionService, private progsvc: ProgramsService,
    private route: ActivatedRoute, private router: Router) {
  }

  changeFromIsSource( event) {
    this.fromIsSource = ('0: true' === event.target.value);
    this.table.setAvailablePrograms(this.fromIsSource);
    this.table.recheckValidity();
    this.table.clearGrid();
  }

  ngOnInit() {
    var my: UpdateProgramExecutionComponent = this;
    this.route.url.subscribe((segments: UrlSegment[]) => {
      var exelineid = segments[segments.length - 1].path;

      forkJoin([
        my.exesvc.getExecutionLineById(exelineid),
        my.exesvc.getExecutionDropdowns(),
      ]).subscribe(data => {
        my.current = {
          line: data[0].result
        };

        my.programfilter = function (el: ExecutionLine) {
          if (my.current.line.id !== el.id) {
            return (my.fromIsSource ? true : el.released > 0);
          }
          return false;
        };

        my.exesvc.getById(my.current.line.phaseId).subscribe(d2 => {
          my.phase = d2.result;
        });

        my.exesvc.hasAppropriation(my.current.line.phaseId).subscribe(d => {
          if (this.current.line.released) {
            if (d.result) {
              // has appropriation, so only BTR and REALIGNMENTS are possible
              this.types.set('EXE_BTR', 'BTR');
              this.types.set('EXE_REALIGNMENT', 'Realignment');
            }
            else {
              this.types.set('EXE_REDISTRIBUTION', 'Redistribution');
            }
          }
          this.types.set('EXE_FM_DIRECTED_ALIGNMENT', 'FM Directed Alignment');
          this.allsubtypes = data[1].result.filter(x => this.types.has(x.type));
          var first = true;
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
  }

  currencyFormatter(x:number) :string {
    
    let r:string = FormatterUtil.currencyFormatter(x, 2, false);
    return r;
  }

  submit() {
    var et: ExecutionEventData = {
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
    this.subtypes = this.allsubtypes.filter(x => (x.type == this.type));
    this.etype = this.subtypes[0];
    var my: UpdateProgramExecutionComponent = this;
    if ('EXE_BTR' === this.type) {
      validationAmount = my.current.line.released;
      // BTR-- only between same PE
      this.linefilter = function (x: ExecutionLine): boolean {
        if (x.programElement === my.current.line.programElement) {
          return true;
        }
        return false;
      };
    }
    else if ('EXE_REALIGNMENT' === this.type) {
      validationAmount = my.current.line.released;
      // realignment-- only between same blin as current
      this.linefilter = function (x: ExecutionLine): boolean {
        if (x.blin === my.current.line.blin){
          return true;
        }
        return false;
      };
    }
    else if ('EXE_REDISTRIBUTION' === this.type) {
      validationAmount = my.current.line.released;
      // redistributions can do whatever
      this.linefilter = function (x: ExecutionLine): boolean {
        return true;
      };
    }
    else if ('EXE_FM_DIRECTED_ALIGNMENT' === this.type) {
      validationAmount = my.current.line.toa;
      this.linefilter = function (x: ExecutionLine): boolean {
        if (x.appropriation === 'PROC') {
          if (x.blin === my.current.line.blin){
            return true
          }
        } else {
          if (x.programElement === my.current.line.programElement) {
            return true;
          }
        }
        return false;
      };
    }
    my.validator = function (x: ExecutionLineWrapper[], totalamt: boolean): boolean[] {
      var total: number = 0;

      x.forEach(elw => {
        total += (elw.amt ? elw.amt : 0);
      });

      var okays: boolean[] = [];

      if (totalamt) {
        // check the total against all the rows
        x.forEach(elw => {
          if (my.fromIsSource) {
            okays.push(total <= validationAmount);
          }
          else {
            // our values are the source, so make sure they have enough money

            if (elw.amt && elw.line && 'undefined' !== typeof elw.line.released ) {
              okays.push( elw.line.released!==0 ? elw.amt <= elw.line.released : false );
            }
            else {
              okays.push(true);
            }
          }
        });
      }
      else {
        // checking individual lines
        // check to make sure we have enough money to spread around
        x.forEach(elw => {
          if (my.fromIsSource) {
            // if fromIsSource, there's nothing to check
            okays.push(elw.amt <= validationAmount);
          }
          else {
            // if we're the source, make sure we have enough money
            if (elw.amt && elw.line && 'undefined' !== typeof elw.line.released) {
              okays.push(elw.line.released !== 0 ? elw.amt <= elw.line.released : false);
            }
            else {
              okays.push(true);
            }
          }
        });
      }
      return okays;
    };

    this.updatelines = this.updatelines.filter(elw => my.linefilter(elw.line));
    this.updatedropdowns2();
  }

  updatedropdowns2() {
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
