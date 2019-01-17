import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Pom, PRService, Program, PB } from '../../../../generated';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';


@Component({
  selector: 'app-pom-analysis',
  templateUrl: './pom-analysis.component.html',
  styleUrls: ['./pom-analysis.component.scss']
})
export class PomAnalysisComponent {
  @ViewChild('entrytable') private agGrid: AgGridNg2;

  private _fy: number;
  private _pb: PB;
  private _pom: Pom;
  private _baseline: boolean = true;
  private _orgmap: Map<string, string> = new Map<string, string>();
  private commtoa: Map<number,number> = new Map<number,number>();
  private pechartdata;
  private bardata;
  private pbprs: Program[];
  private agoptions: GridOptions;
  private pinneddata: RowData[] = [{ orgid: 'Delta', amount: -1, sum: -1 }];

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

  @Input() set pb(p: PB) { 
    this._pb = p;

    if (p) {
      this.prsvc.getByPhase(this.pb.id).subscribe(d => {
        this.pbprs = d.result;
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

  constructor(private prsvc: PRService) {
    var my: PomAnalysisComponent = this;
    var numbersOnly = function (p): boolean {
      var oldval = p.oldValue;
      var cleaned: string = p.newValue.replace(/[^0-9]/g, '');
      var val: number = Number.parseInt(cleaned);

      p.data.amount = val;
      p.data.sum += (val - oldval);

      my.generateOrgChart();
      my.resetPinned();


      console.log(my.pinneddata);

      my.changes.emit({
        year: my.fy,
        orgid: p.data.orgid,
        amount: val,
        sum: my.pinneddata[0].amount
      });
      return true;
    }

    this.agoptions = <GridOptions>{
      gridAutoHeight: true,
      suppressDragLeaveHidesColumns: true,
      suppressMovableColumns: true,
      rowData: [],
      columnDefs: [
        {
          headerName: 'Organization',
          suppressMenu: true,
          field: 'orgid',
          editable: false,
          valueGetter: p => (this.orgmap.has(p.data.orgid)
              ? this.orgmap.get(p.data.orgid)
              : p.data.orgid),
          cellRenderer: params => '<b>' + params.value + '</b>',
          cellClassRules: {
            'ag-cell-footer-sum': params => {
              return params.data.orgid == 'Delta'
            }
          }
        },
        {
          headerValueGetter: () => ('FY' + (this.fy ? this.fy - 2000 : 0)),
          suppressMenu: true,
          field: 'amount',
          editable: p => (!(this.readonly || p.data === this.pinneddata)),
          valueSetter: p=>numbersOnly(p),
          cellClassRules: {
            'ag-cell-edit': p => (!(this.readonly || p.data === this.pinneddata)),
            'ag-cell-footer-sum': p => (p.data.orgid == 'Delta')
          }
        },
        {
          headerValueGetter: () => `FY${this.pom.fy - 2000}-FY${this.pom.fy + 4 - 2000}`,
          suppressMenu: true,
          field: 'sum',
          editable: false,
          cellClassRules: {
            'ag-cell-footer-sum': params => {
              return params.data.orgid == 'Delta'
            }
          }
        }
      ]
    };
  }

  regraph() {
    if (this._fy && this._pom && this._orgmap) {
      this.generateTableRows();
      this.generateOrgChart();
    }
    if (this.pbprs) {
      this.generateTreeMap();
    }
  }

  generateTableRows() {
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

    if (this.agoptions.api) {
      this.agoptions.api.setRowData(newrows);
      this.agoptions.api.refreshHeader();
      this.resetPinned();
    }
  }

  resetPinned() {
    if (!this.agoptions.api) {
      return;
    }

    var tablesum: number = 0;
    var yearsum: number = 0;
    this.agoptions.api.forEachNode(rownode => {
      yearsum += rownode.data.amount;
      tablesum += rownode.data.sum;
    });

    var totalsum: number = 0;
    this.commtoa.forEach((val, year) => { 
      if (year >= this.pom.fy && year < this.pom.fy + 5) {
        totalsum += val;
      }
    });

    this.pinneddata = [{
      orgid: 'Delta',
      amount: this.commtoa.get(this.fy) - yearsum,
      sum: totalsum - tablesum
    }];
  }

  generateTreeMap() {
    var pemap: Map<string, number> = new Map<string, number>();
    var childparentmap: Map<string, string> = new Map<string, string>();
    var apps: Set<string> = new Set<string>();

    this.pbprs.forEach((pr: Program) => {
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
  }

  generateOrgChart() {
    if (!this.agoptions.api) {
      return;
    }

    var subdata: [any[]] = [['Organization', this.fy + ' TOA', { role: 'annotation' }]];
    var totalalloc: number = 0;

    this.agoptions.api.forEachNode(row => { 
      var orgname: string = this.orgmap.get(row.data.orgid);
      var amt: number = row.data.amount;
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
}

interface RowData {
  orgid: string,
  amount: number,
  sum: number
}
