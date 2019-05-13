import {Component, OnInit, ViewChild} from '@angular/core';
import {ExecutionService} from '../../../generated/api/execution.service'
import {Execution} from '../../../generated/model/execution';
import {ActivatedRoute, Router} from '@angular/router';
import {ExecutionDropDown, ExecutionEventData, ExecutionLine} from '../../../generated';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {ExecutionLineWrapper} from '../model/execution-line-wrapper';
import {ExecutionLineFilter} from '../model/execution-line-filter';
import {ExecutionLineTableComponent} from '../execution-line-table/execution-line-table.component';


@Component({
  selector: 'appropriation-release',
  templateUrl: './appropriation-release.component.html',
  styleUrls: ['./appropriation-release.component.scss']
})

export class AppropriationReleaseComponent implements OnInit {
  @ViewChild(ExecutionLineTableComponent) table;
  private updatelines: ExecutionLineWrapper[] = [];
  private phase: Execution;
  private reason: string;
  private etype: ExecutionDropDown;
  private other: string;
  private subtypes: ExecutionDropDown[];
  private progfilter: ExecutionLineFilter;
  private isUploading: boolean;
  private fileid;
  private showAddProgramButton: boolean = false;
  private line: ExecutionLineFilter = function (el: ExecutionLine): boolean {
    return true;
  };

  constructor(private exesvc: ExecutionService, private route: ActivatedRoute,
    private router: Router) {}

  ngOnInit() {
    this.progfilter = (exeline: ExecutionLine): boolean => {
      return !(exeline.appropriated);
    };

    this.route.params.subscribe(data => {
      forkJoin([
        this.exesvc.getById(data.phaseId),
        this.exesvc.getExecutionDropdowns(),
        this.exesvc.hasAppropriation(data.phaseId)
      ]).subscribe(d2 => {
        this.phase = d2[0].result;
        var tmptypes = d2[1].result
          .filter(x => 'EXE_RELEASE' === x.type)
          .filter(x => (d2[2].result ? 'RELEASE_CRA' !== x.subtype : true));
        this.subtypes = tmptypes;
        this.etype = this.subtypes[0];
        this.updatetable();
      });
    });
  }

  submit() {
    var et: ExecutionEventData = {
      toIdAmtLkp: {},
      type: this.etype.subtype,
      reason: this.reason,
    };

    if ('CRA' === this.etype.name) {
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

  updatetable() {
    if ('CRA' === this.etype.name && !this.other ) {
      this.other = '1';
    }

    this.exesvc.getExecutionLinesByPhase(this.phase.id).subscribe(data => {
      this.updatelines = [];
      data.result.filter(z => this.progfilter(z) ).forEach(x => {
        this.updatelines.push({
          line: x,
          amt: ( 'CRA' === this.etype.name ? 0 : x.toa - x.withheld - x.released )
        });
      });
    });
  }

  onUploading(event) {
    this.isUploading = event;
  }

  onFileUploaded(event) {
    this.fileid = event.id;
  }
}
