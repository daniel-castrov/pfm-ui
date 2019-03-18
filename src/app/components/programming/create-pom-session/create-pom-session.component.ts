import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from "rxjs/observable/forkJoin";
import { GridOptions, ColDef } from 'ag-grid';
import { UserUtils } from '../../../services/user.utils';
import { ChartSelectEvent, GoogleChartComponent, ChartMouseOutEvent, ChartMouseOverEvent } from 'ng2-google-charts';
import { ProgramAndPrService } from '../../../services/program-and-pr.service';
import {
  Budget,
  Community,
  CommunityService,
  EppService,
  Organization,
  OrganizationService,
  Pom,
  POMService,
  Program,
  TOA,
  PBService,
  BudgetService
} from '../../../generated';
import { Notify } from "../../../utils/Notify";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-pom-session',
  templateUrl: './create-pom-session.component.html',
  styleUrls: ['./create-pom-session.component.scss']
})

export class CreatePomSessionComponent implements OnInit {
  @ViewChild(GoogleChartComponent) comchart: GoogleChartComponent;
  @ViewChild(GoogleChartComponent) comchartTwo: GoogleChartComponent;
  @ViewChild('content') content: ElementRef;

  private fy: number;
  private community: Community;
  private orgs: Organization[];
  private toaorgs: Map<string,string> = new Map<string,string>();
  private budget: Budget;
  // year->budget info mapping
  private budgets: Map<number, Budget> = new Map<number, Budget>();

  private orgMap: Map<string, string> = new Map<string, string>();
  private originalFyplus4;

  private pomIsCreated: boolean;
  private pomIsOpen: boolean;
  private tooMuchToa: boolean;
  private useEpp: boolean;
  private submitted: boolean;

  private chartdata;
  private subchartdata;
  private pomData;
  private selectedyear: number;
  private analysis_baseline: boolean = true;
  
  private toayear: number;
  private pomyears: number[] = [];
  private scrollstartyear: number;
  private subOrgId: string;
  private pinnedRowCommunityBaseline: any[];
  private subchartIsBar: boolean = true;

  private toainfo: Map<number, OneYearToaData> = new Map<number, OneYearToaData>();

  constructor(private communityService: CommunityService,
    private orgsvc: OrganizationService,
    private pomsvc: POMService,
    private eppsvc: EppService,
    private router: Router,
    private globalsvc: UserUtils,
    private programAndPrService: ProgramAndPrService,
    private pbsvc: PBService,
    private budgetService: BudgetService,
    private modalService: NgbModal) {

    this.chartdata = {
      chartType: 'ColumnChart',
      dataTable: [],
      options: { 'title': 'Community TOA' },
    };
    this.subchartdata = {
      chartType: 'ColumnChart',
      dataTable: [],
      options: { 'title': 'Organizational sub-TOAs' },
    };

  }

  ngOnInit() {
    this.myinit();
  }

  @Input() set toaForYear(val: number) {
    if (this.toainfo.has(this.toayear)) {
      this.toainfo.get(this.toayear).community.amount = val;
    }
    this.resetCharts();
  }

  get toaForYear(): number {
    if (!(this.toayear || this.toainfo.has(this.toayear))) {
      return 0;
    }
    return ( this.toainfo.get(this.toayear).community.amount || 0 );
  }

  open(content, toaAmt) {
    this.modalService.open(content, { centered: true, backdrop: false, backdropClass: 'tooltip-modal-backdrop', windowClass: 'tooltip-modal' }).result.then((result) => {

    }, (reason) => {

    });
  }

  // A valueGetter for totaling a row
  private rowTotal(data, fy: number) {
    let total: number = 0;
    for (var i = 0; i < 5; i++) {
      total += parseInt(data[fy + i], 10);
    }
    return total;
  }

  // A valueGetter for looking up an org name
  private orgName(id: string) {
    return ( this.orgMap.get(id) || id );
  }

  // helper for currency formatting
  private formatCurrency(params) {
    let str = Math.floor(params.value)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    return "$ " + str;
  }

  // Init and fetch all
  private myinit() {
    this.globalsvc.user().subscribe(user => {
      forkJoin([this.communityService.getById(user.currentCommunityId),
        this.orgsvc.getByCommunityId(user.currentCommunityId),
        this.pomsvc.getAll(),
        this.budgetService.getAll(),
        this.pomsvc.getToaSamples(user.currentCommunityId)
      ]).subscribe(data => {

        this.orgs = [];
        this.orgMap.clear();
        this.budgets.clear();
        this.originalFyplus4 = {};
        this.pomIsCreated = false;
        this.pomIsOpen = false;
        this.tooMuchToa = false;
        this.useEpp = false;
        this.submitted = false;

        this.community = data[0].result;
        this.orgs = data[1].result;
        var poms: Pom[] = data[2].result;

        var maxyear = Number.MIN_SAFE_INTEGER;
        data[3].result.forEach(b => {
          if (b.fy > maxyear) {
            maxyear = b.fy;
          }
          this.budgets.set(b.fy, b);
        });
        this.budget = this.budgets.get(maxyear);
        var samplepom: Pom = data[4].result;
        this.fy = this.budget.fy + 1;
        this.scrollstartyear = this.fy;
        this.orgs.forEach(org => this.orgMap.set(org.id, org.abbreviation));

        this.pomyears = [];
        for (let i = 0; i < 5; i++) {
          this.pomyears.push(this.fy + i);
        }

        console.log(this.budgets);

        this.setInitialGridValues(this.fy, poms, samplepom);
      });
    });
  }

  private setInitialGridValues(fy: number, poms: Pom[], samplepom: Pom) {
    let i: number;

    // Is this a new POM?
    var currentPom: Pom = null;
    for (i = 0; i < poms.length; i++) {
      if (poms[i].status === "CREATED") {
        this.pomIsCreated = true;
        currentPom = poms[i];
        break;
      }
      if (poms[i].status === "OPEN") {
        this.pomIsOpen = true;
        currentPom = poms[i];
        break;
      }
    }

    this.pomData = (null == currentPom
      // Use the values from the samplepom ( the previous pb )
      ? samplepom
      : currentPom);
    this.pomData.fy = this.fy;

    this.toaorgs.clear();
    var orgset: Set<string> = new Set<string>();

    this.pomData.communityToas.filter(x => x.year >= fy).forEach(x => { 
      this.toainfo.set(x.year, {
        year: x.year,
        community: {
          amount: x.amount,
          baseline: x.amount
        },
        orgs: new Map<string, AmountAndBaseline>()        
      });
    });

    this.toainfo.forEach((toadata, year) => {
      Object.getOwnPropertyNames(this.pomData.orgToas).forEach(orgid => {
        orgset.add(orgid);

        this.pomData.orgToas[orgid].filter(y => y.year == year).forEach(y => {
          toadata.orgs.set(orgid, {
            amount: y.amount,
            baseline: y.amount
          });
        });
      });
    });

    // make sure we always have the POM's 5 year data
    for (i = 0; i < 5; i++) {
      if (!this.toainfo.has(fy + i)) {
        this.toainfo.set(fy + i, {
          year: fy + i,
          community: {
            amount: 0,
            baseline: 0
          },
          orgs: new Map<string, AmountAndBaseline>()
        });
      }

      // make sure everyone has the same organizations
      orgset.forEach(orgid => {
        this.toaorgs.set(orgid, this.orgName(orgid));

        if (!this.toainfo.get(fy + i).orgs.has(orgid)) {
          this.toainfo.get(fy + i).orgs.set(orgid, {
            amount: 0,
            baseline: 0
          });
        }
      });
    }

    this.resetCharts();
  }

  private submitNewPom() {
    this.submitted = true;
    var transfer: Pom = this.buildTransfer();

    this.pomsvc.createPom(this.community.id, this.fy, transfer, this.useEpp).subscribe(
      (data) => {
        if (data.result) {
          this.router.navigate(['/home']);
        }
      });
  }

  private updatePom() {
    this.submitted = true;
    var transfer: Pom = this.buildTransfer();

    this.pomsvc.updateCurrentPom(this.community.id, transfer).subscribe(
      (data) => {
        if (data.result) {
          this.router.navigate(['/home']);
        }
      });
  }

  private buildTransfer(): Pom {
    var toas: TOA[] = [];
    for (var i = 0; i < 5; i++) {
      var toadata: OneYearToaData = this.toainfo.get(this.fy + i);
      toas.push(
         { year: this.fy + i, amount: toadata.community.amount }
       );
     }

    var otoas: { [key: string]: TOA[]; } = {};
    this.toaorgs.forEach((name,orgid)=>{
      var tlist: TOA[] = [];
       for (var i = 0; i < 5; i++) {
         var toadata: OneYearToaData = this.toainfo.get(this.fy + i);
         tlist.push(
           { year: this.fy + i, amount: toadata.orgs.get(orgid).amount }
         );
       }
       otoas[orgid] = tlist;
     });

    var transfer: Pom = {
      communityId: this.community.id,
      communityToas: toas,
      orgToas: otoas,
      fy: this.fy
    };

    return transfer;
  }

  submitValue(c) {
    this.resetCharts();
    c('close modal');
  }

  resetCharts() {
    var yeartoas: Map<number, number> = new Map<number, number>();

    var totaltoa: number = 0;
    var totalvals: number = 0;

    for (var i = 0; i < 5; i++) {
      var newamt: number = this.toainfo.get(this.scrollstartyear + i).community.amount;
      yeartoas.set(this.fy + i, newamt);
      if (newamt > 0) {
        totaltoa += newamt;
        totalvals += 1;
      }
    }

    var charty: [any[]] = [[
      'Year',
      'TOA',
      { role: 'annotation' },
      { role: 'tooltip', p: { html: true } },
      { role: 'style' },
      'YoY %',
      //{ role: 'annotation' },
      { role: 'tooltip', p: { html: true } },
    ]];

    var baseavg: number = Math.ceil(totaltoa / totalvals);
    for (var i = 0; i < 5; i++) {
      var toainfo: OneYearToaData = this.toainfo.get(this.scrollstartyear + i);

      var newamt = toainfo.community.amount;
      var baseamt: number = toainfo.community.baseline;

      var lastamt = (0 === newamt ? baseavg : newamt);
      var pctdiff: number = (i < 1 ? 0 : (lastamt - this.toainfo.get(this.scrollstartyear + i - 1).community.amount) / lastamt);

      charty.push([
        // YEAR
        (this.scrollstartyear + i).toString(),
        // TOA
        (0 === newamt ? baseavg : newamt),
        // ANNOTATION
        (0 === newamt ? baseavg.toLocaleString() + ' (est.)' : newamt.toLocaleString()),
        // TOOLTIP
        ("<div class='tool-tip-container'>" +
          "<p class='tooltip-fy'>FY" + (this.scrollstartyear + i - 2000) +
          (this.scrollstartyear + i < this.fy ? ' (Budget)' : '') + "</p><h3 class='tooltip-h3'>TOA:<br> " + "<span>" +
          newamt.toLocaleString() + "</span></h3><h3 class='tooltip-h3'>Baseline: <span>" + baseamt.toLocaleString() + "</span></h3></div>"),
        
        // STYLE (color)
        (this.scrollstartyear + i < this.fy ? '#277b24' : '#24527b'),
        // YOY %
        pctdiff,
        // YOY TOOLTIP
        ("<div class='tool-tip-container'>" +
          "<p class='tooltip-fy'>FY" + (this.scrollstartyear + i - 2000) +
          "</p><h3 class='tooltip-h3'>Change Since FY" + (this.fy + i - 2001) + ":<br> " + "<span>" +
          (pctdiff > 0 ? '+' : '') + (pctdiff * 100).toFixed(2).toLocaleString() + "%</span></h3></div>"),
      ]);
    }

    this.chartdata = {
      chartType: 'ComboChart',
      dataTable: charty,
      options: {
        title: 'Community TOA',

        series: {
          0: { targetAxisIndex: 0, type: 'bars' },
          1: { targetAxisIndex: 1, type: 'line' },
        },
        vAxes: {
          0: {
          },
          1: {
            gridlines: { color: 'transparent' },
            format: "#%"
          },
        },

        //selectionMode: 'multiple',
        aggregationTarget: 'auto',

        tooltip: {
          isHtml: true,
          trigger: 'focus'
        },
        colors: ['#24527b', '#6495ed'],
        height: 300,
        animation: {
          'startup': true,
          duration: 600,
          easing: 'inAndOut'
        }
      }
    };
  }

  select(event: ChartSelectEvent) {
    if ('deselect' === event.message) {
      delete this.selectedyear;
      delete this.toayear;
    }
    else if ('select' === event.message) {
      this.selectedyear = this.fy + event.row;
      this.toayear = this.selectedyear;
      this.analysis_baseline = (1 === event.column);
      this.resetSubchart();
    }
  }

  subselect(event: ChartSelectEvent) {
    if ('deselect' === event.message) {
      delete this.subOrgId;
    }
    else if ('select' === event.message) {
      // figure out orgid from org name (reverse of orgMap)
      this.orgMap.forEach((name, id) => { 
        if (name === event.selectedRowValues[0]) {
          this.subOrgId = id;
        }
      });
    }
  }

  toggleSubchart() {
    this.subchartIsBar = !this.subchartIsBar;
    this.resetSubchart();
  }

  chartready() {
    //this.addAction(this.comchart.wrapper.getChart());
  }

  resetSubchart() {
    var charty: [any[]] = [[
      'Organization',
      // 'Baseline',
      'TOA',
      { role: 'annotation' },
      // { role: 'style' },
      { role: 'tooltip', p: { html: true } }
    ]];

    this.toainfo.get(this.selectedyear).orgs.forEach( (amt, orgid)=>{
      var orgname: string = this.orgName(orgid);

      var value = amt.amount;
      var baseamt = amt.baseline;
      charty.push([orgname,
        value,
        value,
        ("<div class='tool-tip-container'>" +
          "<p class='tooltip-fy'>FY" + (this.selectedyear - 2000) +
          "</p><h3 class='tooltip-h3'>TOA:<br> " + "<span class='toa'>" +
          value.toLocaleString() + "</span></h3><h3 class='tooltip-h3'>Baseline: <span class='base'>" + baseamt.toLocaleString() + "</span></h3></div>")
      ]);
    });

    var options = {
      title: 'Organizational sub-TOA',
      vAxis: {
        minValue: 5
      },
      tooltip: {
        isHtml: true,
        trigger: 'focus'
      },
      colors: ['#24527b'],
      height: 500,
      animation: {
        'startup': true,
        duration: 600,
        easing: 'inAndOut'
      }
    };

    if (!this.subchartIsBar) {
      delete options.colors;
    }

    this.subchartdata = {
      chartType: ( this.subchartIsBar ? 'ColumnChart' : 'PieChart' ),
      dataTable: charty,
      options: options
    };
  }

  onAnalysis(event) {
    // this.rowsOrgs.forEach(obj => {
    //   if (obj.orgid === event.orgid) {
    //     obj[event.year] = event.amount;
    //   }
    // });

    // var newpomdata: Pom = Object.assign({}, this.pomData);

    // var found: boolean = false;
    // newpomdata.orgToas[event.orgid].forEach(toa => {
    //   if (toa.year === event.year) {
    //     toa.amount = event.amount;
    //     found = true;
    //   }
    // });
    // if (!found) {
    //   newpomdata.orgToas[event.orgid].push({
    //     year: event.year,
    //     amount: event.amount
    //   });
    // }
    // this.pomData = newpomdata;
  }

  @Input() set subOrgVal(val: number) {
    if (this.toainfo.has(this.selectedyear)) {
      this.toainfo.get(this.selectedyear).orgs.get(this.subOrgId).amount = val;
      this.resetSubchart();
    }
  }

  get subOrgVal(): number {
    if ('undefined' === typeof this.subOrgId || !this.toainfo.get(this.selectedyear).orgs.has(this.subOrgId)) {
      return 0;
    }

    return this.toainfo.get(this.selectedyear).orgs.get(this.subOrgId).amount;
  }

  scroll(years: number) {
    if (this.scrollstartyear + years <= this.fy) {
      this.scrollstartyear += years;

      var reset: boolean = true;
      if (this.scrollstartyear < this.fy && !this.toainfo.has(this.scrollstartyear)) {
        reset = false;
        this.fetchMoreData(this.scrollstartyear);
      }

      if (reset) {
        this.resetCharts();
      }
    }
  }

  fetchMoreData(year: number) {
    this.pbsvc.getFinalByYear(year).subscribe(ps => {
      var pbs: Program[] = ps.result;
      var toadata: OneYearToaData = {
        year: year,
        community: {
          amount: 0,
          baseline: 0
        },
        orgs: new Map<string, AmountAndBaseline>()
      };

      pbs.forEach(prog => { 
        var orgid = prog.organizationId;
        if (!toadata.orgs.has(orgid)) {
          toadata.orgs.set(orgid, {
            amount: 0,
            baseline: 0
          });
        }

        prog.fundingLines.forEach(fl => { 
          toadata.orgs.get(orgid).amount += fl.funds[year];
          toadata.orgs.get(orgid).baseline += fl.funds[year];
          toadata.community.amount += fl.funds[year];
          toadata.community.baseline += fl.funds[year];
        });
      });

      this.toainfo.set(year, toadata);

      this.resetCharts();
    });
  }
}

interface AmountAndBaseline {
  amount: number,
  baseline: number
}

interface OneYearToaData {
  year: number,
  community: AmountAndBaseline,
  orgs:Map<string, AmountAndBaseline> // org id-> toa data
}
