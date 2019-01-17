import { Component, Input } from '@angular/core';
import { Pom, PRService, Program, PB } from '../../../../generated';

@Component({
  selector: 'app-pom-analysis',
  templateUrl: './pom-analysis.component.html',
  styleUrls: ['./pom-analysis.component.scss']
})
export class PomAnalysisComponent {
  private _fy: number;
  private _pb: PB;
  private _pom: Pom;
  private _baseline: boolean = true;
  private _orgmap: Map<string, string> = new Map<string, string>();
  private pechartdata;
  private bardata;

  @Input() set baseline(b: boolean) {
    this._baseline = b;

    if (this._fy && this._pom && this._orgmap) {
      this.generateOrgChart();
    }
  }

  @Input() set orgmap(map: Map<string, string>) {
    this._orgmap = map;
    if (this._fy && this._pom && this._orgmap) {
      this.generateOrgChart();
    }
  }

  @Input() set pb(p: PB) { 
    this._pb = p;
    this.generateTreeMap();
  }

  @Input() set pom(p: Pom) {
    this._pom = p;
    if ( this._fy && this._pom && this._orgmap) {
      this.generateOrgChart();
    }
  }
  
  @Input() set fy(year: number) {
    this._fy = year;

    if ( this._fy && this._pom && this._orgmap) {
      this.generateOrgChart();
    }
  }

  get fy(): number {
    return this._fy;
  }

  get pb(): PB {
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

  constructor( private prsvc:PRService) { }

  generateTreeMap() {
    this.prsvc.getByPhase(this.pb.id).subscribe(d => {
      var pemap: Map<string, number> = new Map<string, number>();
      var childparentmap: Map<string, string> = new Map<string, string>();
      var apps: Set<string> = new Set<string>();

      d.result.forEach((pr: Program) => {
        pr.fundingLines.forEach(fl => {
          var cost: number = (pemap.has(fl.baOrBlin) ? pemap.get(fl.baOrBlin) : 0);
          pemap.set(fl.baOrBlin, cost + fl.funds[this.fy]);
          childparentmap.set(fl.baOrBlin, fl.appropriation);
          apps.add(fl.appropriation);
        });
      });

      var data: [string[], (string | number)[]] = [
        ['BA/Blin', 'Parent', `${this.fy} Allocation`, 'color'],
        [this.fy.toString(), null, 0, 0],
      ];

      apps.forEach(app => {
        data.push([app, this.fy.toString(), 0, 0]);
      });

      pemap.forEach((num, pe) => {
        data.push([pe, childparentmap.get(pe), num, 0]);
      });

      this.pechartdata = {
        chartType: 'TreeMap',
        dataTable: data,
        options: { 'title': 'BA/Blin Breakdown' },
      }
    });
  }

  generateOrgChart() {
    var subdata: [any[]] = [['Organization', this.fy + ' TOA', { role: 'annotation' }]];
    var totalalloc: number = 0;

    Object.getOwnPropertyNames(this.pom.orgToas).forEach(orgid => {
      var orgname: string = this.orgmap.get(orgid);
      var toamap: Map<number, number> = new Map<number, number>();
      toamap.set(this.fy, 0); // just in case

      this.pom.orgToas[orgid].forEach(toa => { 
        toamap.set(toa.year, toa.amount);
      });

      var amt: number = toamap.get(this.fy);
      subdata.push([orgname, amt, amt]);
      totalalloc += amt;
    });

    /*
    // add an "unallocated" pie wedge, too (if we can!)
    var maxtoa: number = this.chartdata.dataTable[myfy - this.fy + 1][isbaseline ? 1 : 2];
    if (totalalloc < maxtoa) {
      subdata.push(['Unallocated', maxtoa - totalalloc, maxtoa - totalalloc]);
    }
    */
    
    this.bardata = {
      chartType: 'PieChart',
      dataTable: subdata,
      options: {
        title: `FY${this.fy - 2000} Organizational TOA Breakdown` + (this.baseline ? ' (Baseline)' : '')
      }
    };
  }
}
