import { Component, OnInit, ViewChild } from '@angular/core'

// Other Components
import { HeaderComponent } from '../../header/header.component'
import { Router, UrlSegment, ActivatedRoute } from '@angular/router'
import { ExecutionService, ProgramsService, ExecutionLine, OandEService, Execution, OandEMonthly, ExecutionEvent } from '../../../generated';

import { forkJoin } from 'rxjs/observable/forkJoin';

@Component({
  selector: 'program-execution-line',
  templateUrl: './program-execution-line.component.html',
  styleUrls: ['./program-execution-line.component.scss']
})
export class ProgramExecutionLineComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private exeline: ExecutionLine;
  private exe: Execution;
  private oandes: OandEMonthly[];
  private snapshotMap: Map<Date, ExecutionLine>;
  private program: string;

  constructor(private exesvc: ExecutionService, private progsvc: ProgramsService,
    private oandesvc: OandEService, private route: ActivatedRoute) { }

  ngOnInit() {
    var my: ProgramExecutionLineComponent = this;
    this.route.url.subscribe((segments: UrlSegment[]) => {
      var exelineid = segments[segments.length - 1].path;

      forkJoin([
        this.exesvc.getExecutionLineById(exelineid),
        this.oandesvc.getByExecutionLineId(exelineid),
        this.exesvc.getExecutionLineMonthlySnapshots(exelineid)
      ]).subscribe(d => {        
        this.exeline = d[0].result;
        this.oandes = d[1].result;
        this.program = this.exeline.programName;
        this.snapshotMap = new Map<Date, ExecutionLine>();
        Object.getOwnPropertyNames(d[2].result).forEach(key => { 
          this.snapshotMap.set(new Date( key ), d[2].result[key]);
        });

        this.exesvc.getById(this.exeline.phaseId).subscribe(d2 => {
          this.exe = d2.result;
        });
      });
    });
  }
}
