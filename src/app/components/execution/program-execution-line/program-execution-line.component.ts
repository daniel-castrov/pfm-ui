import { Component, OnInit, ViewChild } from '@angular/core'

// Other Components
import { HeaderComponent } from '../../header/header.component'
import { UrlSegment, ActivatedRoute } from '@angular/router'
import { ExecutionService, ProgramsService, ExecutionLine, OandEService, Execution, OandEMonthly, ExecutionEvent } from '../../../generated';

import { forkJoin } from 'rxjs/observable/forkJoin';
import { ActualsTabComponent } from '../actuals-tab/actuals-tab.component';

@Component({
  selector: 'program-execution-line',
  templateUrl: './program-execution-line.component.html',
  styleUrls: ['./program-execution-line.component.scss']
})
export class ProgramExecutionLineComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @ViewChild(ActualsTabComponent) actualstab;
  private exeline: ExecutionLine;
  private exe: Execution;
  private oandes: OandEMonthly[];
  private deltaMap: Map<Date, ExecutionLine>;
  private program: string;

  constructor(private exesvc: ExecutionService, private progsvc: ProgramsService,
    private oandesvc: OandEService, private route: ActivatedRoute) { }

  ngOnInit() {
    var my: ProgramExecutionLineComponent = this;
    this.route.url.subscribe((segments: UrlSegment[]) => {
      var exelineid = segments[segments.length - 1].path;
      this.refresh( exelineid);
    });
  }

  refresh( exelineid ) {
    forkJoin([
      this.exesvc.getExecutionLineById(exelineid),
      this.oandesvc.getByExecutionLineId(exelineid),
      this.exesvc.getExecutionLineMonthlyDeltas(exelineid)
    ]).subscribe(d => {
      this.exeline = d[0].result;
      this.oandes = d[1].result;
      this.program = this.exeline.programName;
      this.deltaMap = new Map<Date, ExecutionLine>();
      Object.getOwnPropertyNames(d[2].result).forEach(key => {
        this.deltaMap.set(new Date(key), d[2].result[key]);
      });

      this.exesvc.getById(this.exeline.phaseId).subscribe(d2 => {
        this.exe = d2.result;
      });
    });
  }
}
