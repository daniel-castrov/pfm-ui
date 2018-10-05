import { Component, OnInit, ViewChild } from '@angular/core'

// Other Components
import { HeaderComponent } from '../../header/header.component'
import { Router, UrlSegment, ActivatedRoute } from '@angular/router'
import { ExecutionService, ProgramsService, ExecutionLine, OandEService, Execution, OandEMonthly, ExecutionEvent } from '../../../generated';
import { NotifyUtil } from '../../../utils/NotifyUtil';

import { forkJoin } from 'rxjs/observable/forkJoin';
import { ActualsTabComponent } from '../actuals-tab/actuals-tab.component';
import { ToaAndReleased, OandETools } from '../model/oande-tools';

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
          this.deltaMap.set(new Date( key ), d[2].result[key]);
        });

        this.exesvc.getById(this.exeline.phaseId).subscribe(d2 => {
          this.exe = d2.result;
        });
      });
    });
  }

  save(tag) {
    // the actuals tab might have to get more info from the user, so 
    // this function doesn't return immediately.
    var obs = this.actualstab.monthlies().subscribe(data => {
      if (this.actualstab.isadmin) {
        console.log(data);
        this.oandesvc.createAdminMonthlyInput(this.exeline.id, data).subscribe(d2 => {
          if (d2.error) {
            NotifyUtil.notifyError(d2.error);
          }
          else {
            NotifyUtil.notifySuccess('Data saved');
          }
        });
      }
      else {
        this.oandesvc.createMonthlyInput(this.exeline.id, data[0]).subscribe(data => {
          if (data.error) {
            NotifyUtil.notifyError(data.error);
          }
          else {
            NotifyUtil.notifySuccess('Data saved');
          }
        });
      }
    });
  }
}
