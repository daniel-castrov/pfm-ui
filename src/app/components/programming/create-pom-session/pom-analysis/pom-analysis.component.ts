import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Pom, PRService, Program, Budget } from '../../../../generated';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { ProgramAndPrService } from '../../../../services/program-and-pr.service';


@Component({
  selector: 'app-pom-analysis',
  templateUrl: './pom-analysis.component.html',
  styleUrls: ['./pom-analysis.component.scss']
})
export class PomAnalysisComponent {
  @ViewChild('entrytable') private agGrid: AgGridNg2;

  private _fy: number;
  private _pb: Budget;
  private _pom: Pom;
  private _baseline: boolean = true;
  private _orgmap: Map<string, string> = new Map<string, string>();
  private commtoa: Map<number,number> = new Map<number,number>();
  private pechartdata;
  private bardata;
  private pbprs: Program[];
  private agoptions: GridOptions;
  private pinneddata: RowData[] = [{ orgid: 'Delta', amount: -1, sum: -1 }];
  private treeBreadcrumbs: string;
  private treechartdata;

  @Input() private readonly: boolean = true;
  @Output() changes: EventEmitter<any> = new EventEmitter<any>();

  @Input() set baseline(b: boolean) {
    this._baseline = b;
    this.regraph();
  }

  @Input() set orgmap(map: Map<string, string>) {
    this._orgmap = map;
    this.regraph();
  }

  @Input() set commdata(t: any) {
    this.commtoa.clear();
    Object.getOwnPropertyNames(t).forEach(v => {
      var year = parseInt(v) || -1;
      if (year > 0) {
        this.commtoa.set(year, t[year]);
      }
    });

    this.regraph();
  }

  @Input() set pb(p: Budget) {
    this._pb = p;

    if (p) {
      this.prsvc.programRequests(this.pb.finalPbId).then(ps => {
        this.pbprs = ps;
        this.regraph();
      });
    }
  }

  @Input() set pom(p: Pom) {
    this._pom = p;
    this.regraph();
  }

  @Input() set fy(year: number) {
    this._fy = year;

    this.regraph();
  }

  get fy(): number {
    return this._fy;
  }

  get pb(): Budget {
    return this._pb;
  }

  get pom(): Pom {
    return this._pom;
  }

  get orgmap(): Map<string, string>{
    return this._orgmap;
  }

  get baseline(): boolean {
    return this._baseline;
  }

  constructor(private prsvc: ProgramAndPrService) {
  }

  regraph() {
    if (this._fy && this._pom && this._orgmap) {
      this.generateOrgChart();
    }
    if (this.pbprs) {
      this.generateTreeMap();
    }
  }

  generateTableRows(): RowData[] {
    var newrows: RowData[] = [];
    Object.getOwnPropertyNames(this.pom.orgToas).forEach(orgid => {
      var toamap: Map<number, number> = new Map<number, number>();
      toamap.set(this.fy, 0); // just in case

      this.pom.orgToas[orgid].forEach(toa => {
        toamap.set(toa.year, toa.amount);
      });
      var amt: number = toamap.get(this.fy);

      var orgsum: number = 0;
      for (var year: number = this.pom.fy; year < this.pom.fy + 4; year++) {
        orgsum += (toamap.has(year)
          ? toamap.get(year)
          : 0);
      }

      newrows.push({
        orgid: orgid,
        amount: amt,
        sum: orgsum
      });
    });

    return newrows;
  }

  generateTreeMap() {
    var pemap: Map<string, number> = new Map<string, number>();
    var childparentmap: Map<string, string> = new Map<string, string>();
    var apps: Set<string> = new Set<string>();
    var totals: Map<string, number> = new Map<string, number>(); // for bar chart

    this.pbprs.forEach((pr: Program) => {
      pr.fundingLines.forEach(fl => {
        var cost: number = (pemap.has(fl.baOrBlin) ? pemap.get(fl.baOrBlin) : 0);
        var fund: number = fl.funds[this.fy];
        pemap.set(fl.baOrBlin, cost + fund);
        childparentmap.set(fl.baOrBlin, fl.appropriation);
        apps.add(fl.appropriation);

        totals.set(pr.organizationId, fund + (totals.get(pr.organizationId) || 0));
      });
    });

    var data: [string[], (string | number)[]] = [
      ['BA/Blin', 'Parent', `${this.fy} Allocation`, 'color'],
      [this.fy.toString(), null, 0, 0],
    ];
    this.treeBreadcrumbs = this.fy.toString();

    apps.forEach(app => {
      data.push([app, this.fy.toString(), 0, 0]);
    });

    pemap.forEach((num, pe) => {
      data.push([pe, childparentmap.get(pe), num, 0]);
    });

    this.pechartdata = {
      chartType: 'TreeMap',
      dataTable: data,
      // options: { 'title': 'Baseline BA/Blin Breakdown' },
    }

    //make the initial bar chart, too
    var tdata: any[] = [['Organization', `${this.fy} Baseline`]];
    totals.forEach((sum, orgid) => {
      tdata.push([this.orgmap.get(orgid), sum]);
    });

    this.treechartdata = {
      chartType: 'BarChart',
      dataTable: tdata,
      options: { title: this.treeBreadcrumbs },
    };
  }

  generateOrgChart() {
    var rows: RowData[] = this.generateTableRows();
    var subdata: [any[]] = [['Organization', this.fy + ' TOA', { role: 'annotation' }]];
    var totalalloc: number = 0;

    rows.forEach(row => {
      var orgname: string = this.orgmap.get(row.orgid);
      var amt: number = row.amount;
      subdata.push([orgname, amt, amt]);
      totalalloc += amt;
    });

    // add an "unallocated" pie wedge, too (if we can!)
    var maxtoa: number = this.commtoa.get(this.fy) || 0;

    if (totalalloc < maxtoa) {
      subdata.push(['Unallocated', maxtoa - totalalloc, maxtoa - totalalloc]);
    }

    this.bardata = {
      chartType: 'PieChart',
      dataTable: subdata,
      options: {
        title: `FY${this.fy - 2000} Organizational TOA Breakdown` + (this.baseline ? ' (Baseline)' : '')
      }
    };
  }

  onGridReady(params) {
    if (this._fy && this._pom && this._orgmap) {
      this.generateTableRows();
      this.generateOrgChart();
    }

    params.api.sizeColumnsToFit();
    window.addEventListener("resize", function () {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  private negativeNumberRenderer(params) {

    if (params.value < 0) {
      return '<span style="color: red;">' + this.formatCurrency(params) + '</span>';
    } else {
      return this.formatCurrency(params);
    }
  }

  private formatCurrency(params) {
    let str = Math.floor(params.value)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    return "$ " + str;
  }

  selectTree(event) {
    // treemaps appear to only do 'selects', so whenever
    // we get in this function, figure out where we are
    var todo: number[] = [event.row + 1];
    var dones: string[] = [];
    while (todo.length > 0) {
      var idx: number = todo.pop();
      var row = this.pechartdata.dataTable[idx];
      dones.push(row[0]);

      if (null !== row[1]) {
        for (var i = 0; i < idx; i++) {
          if (this.pechartdata.dataTable[i][0] === this.pechartdata.dataTable[idx][1]) {
            todo.push(i);
          }
        }
      }
    }

    this.treeBreadcrumbs = dones.reverse().join('::');

    var data: any[] = [
      ['Organization', `${this.fy} Baseline`]
    ];
    // now that we know where we are, populate the table
    var totals: Map<string, number> = new Map<string, number>();

    this.pbprs.forEach(prog => {
      var sum = totals.get(prog.organizationId) || 0;
      prog.fundingLines.filter(fl => {
        if (3 === dones.length) {
          return (fl.baOrBlin === dones[2]);
        }
        else if (2 === dones.length) {
          return (fl.appropriation === dones[1]);
        }
        else {
          return true;
        }
      }).forEach(fl => {
        if (fl.funds[this.fy]) {
          sum += fl.funds[this.fy];
        }
      });

      totals.set(prog.organizationId, sum);
    });

    totals.forEach((sum, orgid) => {
      data.push([this.orgmap.get(orgid), sum]);
    });

    this.treechartdata = {
      chartType: 'BarChart',
      dataTable: data,
      options: { title: this.treeBreadcrumbs },
    };
  }
}

interface RowData {
  orgid: string,
  amount: number,
  sum: number
}
