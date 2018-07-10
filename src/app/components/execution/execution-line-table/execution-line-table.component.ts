import { Component, OnInit, ViewChild, Input } from '@angular/core'
import * as $ from 'jquery'

// Other Components
import { HeaderComponent } from '../../../components/header/header.component'
import { Router } from '@angular/router'
import { ExecutionService, Execution, MyDetailsService, Program, ExecutionLine } from '../../../generated'
import { GlobalsService } from '../../../services/globals.service'
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ProgramsService } from '../../../generated/api/programs.service';
import { ExcelTable } from 'ag-grid/dist/lib/interfaces/iExcelCreator';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'app-execution-line-table',
  templateUrl: './execution-line-table.component.html',
  styleUrls: ['./execution-line-table.component.scss']
})
export class ExecutionLineTableComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @Input() private phase: Execution;
  @Input() private updatelines: ExecutionLine[];
  private allexelines: ExecutionLine[] = [];
  private programIdNameLkp: Map<string, string> = new Map<string, string>();

  constructor(private exesvc: ExecutionService, private usersvc: MyDetailsService,
    private progsvc: ProgramsService, private router: Router) { }

  ngOnInit() {
    var my: ExecutionLineTableComponent = this;
    forkJoin([
      my.progsvc.getIdNameMap()
    ]).subscribe(data => {

      my.exesvc.getExecutionLinesByPhase(this.phase.id).subscribe(d2 => {
        my.allexelines = d2.result;
      });

      Object.getOwnPropertyNames(data[0].result).forEach(id => {
        my.programIdNameLkp.set(id, data[0].result[id]);
      });
    });
  }

  fullname(exeline: ExecutionLine): string {
    if (this.programIdNameLkp && exeline) {
      return this.programIdNameLkp.get(exeline.mrId);
    }
    else {
      return '';
    }
  }

  addrow() {
    this.updatelines.push({});
  }

  removerow(i) {
    this.updatelines.splice(i, 1);
  }

  setline(updateidx: number, lineidx: number) {
    var my: ExecutionLineTableComponent = this;
    var toupdate: ExecutionLine = my.updatelines[updateidx];

    var l: ExecutionLine = my.getLineChoices(toupdate.mrId)[lineidx - 1];
    toupdate.appropriation = l.appropriation;
    toupdate.blin = l.blin;
    toupdate.item = l.item;
    toupdate.opAgency = l.opAgency;
    toupdate.toa = 0;
    toupdate.released = 0;
    toupdate.id = l.id;
  }

  getLineChoices(mrid): ExecutionLine[] {
    return this.allexelines.filter(x => x.mrId === mrid);
  }

  onedit(amtstr, updateidx) {
    var my: ExecutionLineTableComponent = this;
    var toupdate: ExecutionLine = my.updatelines[updateidx];
    toupdate.released = Number.parseInt(amtstr);
  }

  total(): number {
    var my: ExecutionLineTableComponent = this;

    var tot: number = 0;
    for (var i = 0; i < my.updatelines.length; i++) {
      if (my.updatelines[i].released) {
        tot += my.updatelines[i].released;
      }
    }

    return tot;
  }
}
