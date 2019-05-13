import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, UrlSegment} from '@angular/router';
import {Execution, ExecutionLine, ExecutionService, OandEMonthly, OandEService} from '../../../generated';
import {ActualsTabComponent} from '../actuals-tab/actuals-tab.component';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'program-execution-line',
  templateUrl: './program-execution-line.component.html',
  styleUrls: ['./program-execution-line.component.scss']
})
export class ProgramExecutionLineComponent implements OnInit {
  @ViewChild(ActualsTabComponent) actualstab;
  private exeline: ExecutionLine;
  private exe: Execution;
  private oandes: OandEMonthly[];
  private deltaMap: Map<Date, ExecutionLine>;
  private program: string;
  private showPercentages: boolean = true;
  private hash: string;

  constructor(private exesvc: ExecutionService,
              private oandesvc: OandEService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    var my: ProgramExecutionLineComponent = this;
    this.route.url.subscribe((segments: UrlSegment[]) => {
      var exelineid = segments[segments.length - 1].path;
      this.refresh( exelineid);
    });
    this.route.fragment.subscribe(f => { 
      if ('SpendPlan' === f || 'Actuals' === f || 'Graph' === f) {
        this.hash = f;
      }
      else {
        this.hash = 'SpendPlan'; // default tab is SpendPlans?
      }
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

  onTogglePct() {
    this.showPercentages = !this.showPercentages;    
  }
}
