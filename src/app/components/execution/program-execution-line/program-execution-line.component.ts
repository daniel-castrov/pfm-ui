import { Component, OnInit, ViewChild } from '@angular/core'

// Other Components
import { HeaderComponent } from '../../header/header.component'
import { Router, UrlSegment, ActivatedRoute } from '@angular/router'
import { ExecutionService, ProgramsService, ExecutionLine, OandEService, Execution, OandEMonthly } from '../../../generated';

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
  private program: string;

  constructor(private exesvc: ExecutionService, private progsvc: ProgramsService,
    private oandesvc:OandEService, private route: ActivatedRoute) { }

  ngOnInit() {
    var my: ProgramExecutionLineComponent = this;
    this.route.url.subscribe((segments: UrlSegment[]) => {
      var exelineid = segments[segments.length - 1].path;

      this.exesvc.getExecutionLineById(exelineid).subscribe(d => {
        this.exeline = d.result;

        forkJoin([
          this.exesvc.getById(this.exeline.phaseId),
          this.oandesvc.getByExecutionLineId(this.exeline.id),
        ]).subscribe(d2 => {
          this.exe = d2[0].result;
          this.oandes = d2[1].result;
          this.program = this.exeline.programName;

          this.oandes.push({});
          this.oandes.push({});
        });
      });
    });
  }
}
