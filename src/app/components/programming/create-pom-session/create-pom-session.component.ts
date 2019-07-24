import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from "rxjs/observable/forkJoin";
import { UserUtils } from '../../../services/user.utils';
import { ChartSelectEvent, GoogleChartComponent} from 'ng2-google-charts';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreatePomSessionService } from './create-pom-session.service';
import { TemplateParseResult } from '@angular/compiler';
//import { CommunityModalComponent } from './community-modal/community-modal.component';
// import { CreatePomSessionService } from './create-pom-session.service';

@Component({
  selector: 'app-create-pom-session',
  templateUrl: './create-pom-session.component.html',
  styleUrls: ['./create-pom-session.component.scss']
})

export class CreatePomSessionComponent implements OnInit {
  @ViewChild(GoogleChartComponent) comchart: GoogleChartComponent;
  @ViewChild(GoogleChartComponent) comchartTwo: GoogleChartComponent;
  @ViewChild('content') content: ElementRef;

  private YEARSTOSHOW: number = 5; // this is really a constant
  private BUDGETHORIZON: number = 5; // this is really a constant
  private pomfy: number;
  private community: Community;
  private orgs: Organization[];
  // org id->org name only for orgs in a toa (not all orgs)
  private toaorgs: Map<string,string> = new Map<string,string>();
  private budget: Budget;
  // year->budget info mapping
  private budgets: Map<number, Budget> = new Map<number, Budget>();

  private orgMap: Map<string, string> = new Map<string, string>();

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
  private scrollstartyear: number;
  private subchartIsBar: boolean = true;

  private toainfo: Map<number, OneYearToaData> = new Map<number, OneYearToaData>();
  private suborgdata: OneYearToaData;
  yearData: Map<number, OneYearToaData>;
  @Output() data = new EventEmitter<any>();
  hide : boolean = false;
  hide1 : boolean =false;
  amount: any;
  payloadYear: any;
  screenw : any;
  scrollLastYear: number;
  updateYearsOnScroll: any=[];


  constructor(private communityService: CommunityService,
    private orgsvc: OrganizationService,
    private pomsvc: POMService,
    private eppsvc: EppService,
    private router: Router,
    private globalsvc: UserUtils,
    private programAndPrService: ProgramAndPrService,
    private pbsvc: PBService,
    private budgetService: BudgetService,
    private modalService: NgbModal,
    private createPomSessionService: CreatePomSessionService) {

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
  // var ddd = window.innerWidth;
  ngOnInit() {
    this.myinit();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    event.target.innerWidth;
    this.resetCharts();
    this.resetSubchart();
    console.log("width", event.target.innerWidth);
  }

  @Input() set toaForYear(val: number) {
    console.log('value',val);
    var data: OneYearToaData = this.getToaDataOrBlank(this.toayear);
    data.community.amount = val;
    this.toainfo.set(this.toayear, data);
     console.log('year',this.toayear);
    this.resetCharts();
  } 
  // val=this.amount;
  // console.log('value',val);
  // this.toayear1 = this.payloadYear
  // var data: OneYearToaData = this.getToaDataOrBlank(this.toayear1);
  // console.log('yyyyy',this.toayear);

  open1() {
    this.hide = true;
  }
  openModal(){
    this.hide1 = true;
  }
  closeModal(){
    this.hide1 = false;
  }
  
sendData(){
    this.data.emit(this.toainfo);
    console.log('emit data',this.toainfo);
  }
  get toaForYear(): number {
    if (!this.toayear ){
      return 0;
    }
    return this.getToaDataOrBlank(this.toayear).community.amount;
  }
 

  @Input() get selectedtoainfo(): OneYearToaData {
    console.log('this.toainfo.get(this.selectedyear)',this.toainfo.get(this.selectedyear))
    return this.toainfo.get(this.selectedyear);
  }

  open(content, toaAmt) {
    this.modalService.open(content, { centered: true, backdrop: false, backdropClass: 'tooltip-modal-backdrop', windowClass: 'tooltip-modal' }).result.then((result) => {

    }, (reason) => {

    });
  }

  receiveUpdatedData(hide) {
    this.hide = hide;
  }
  receiveUpdatedData1(payload) {
    this.amount = payload.amount;
    this.payloadYear = payload.year;
    console.log('payload data111',payload);
    var data: OneYearToaData = this.getToaDataOrBlank(this.payloadYear);
    data.community.amount = this.amount;
    this.toainfo.set(this.payloadYear, data);
     console.log('year',this.payloadYear);
    this.resetCharts();
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
        this.pomfy = this.budget.fy + 1;
        this.scrollstartyear = this.pomfy;
        debugger;
    for(let yr = this.pomfy ;yr<this.pomfy+5;yr++){
      this.updateYearsOnScroll.push(yr);
    }
        this.createPomSessionService.setCurrentYear(this.pomfy,this.scrollstartyear);
        this.orgs.forEach(org => this.orgMap.set(org.id, org.abbreviation));

        this.setInitialGridValues(this.pomfy, poms, samplepom);
      });
    });
  
    this.createPomSessionService.setYears(this.toainfo);
  }
  
  @Input() get pomyears(): number[] { 
    this.yearData = this.toainfo;
    if (this.pomfy) {
      // we want to have all years from pomfy to our max TOA year,
      var maxtoayear: number = this.pomfy;
      this.toainfo.forEach((x, year) => {
        if (year > maxtoayear) {
          maxtoayear = year;
        }
      });
      // console.log('data',this.toainfo);
      maxtoayear = Math.max(maxtoayear, this.scrollstartyear + this.BUDGETHORIZON - 1);
      
      var newpomyears: number[] = [];
      for (var y = this.pomfy; y <= maxtoayear; y++) {
        newpomyears.push(y);
      }
      return newpomyears;
    }
    return [];
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
    this.pomData.fy = this.pomfy;

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
    for (i = 0; i < this.YEARSTOSHOW; i++) {
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

    this.pomsvc.createPom(this.community.id, this.pomfy, transfer, this.useEpp).subscribe(
      (data) => {
        if (data.result) {
          this.router.navigate(['/home']);
        }
      });
  }

  private updatePom() {
    this.submitted = true;
    var transfer: Pom = this.buildTransfer();

    this.pomsvc.updateCurrentPom(transfer).subscribe(
      (data) => {
        if (data.result) {
          this.router.navigate(['/home']);
        }
      });
  }

  private buildTransfer(): Pom {
    var toas: TOA[] = [];
    for (var i = 0; i < this.YEARSTOSHOW; i++) {
      var toadata: OneYearToaData = this.toainfo.get(this.pomfy + i);
      toas.push(
         { year: this.pomfy + i, amount: toadata.community.amount }
       );
     }

    var otoas: { [key: string]: TOA[]; } = {};
    this.toaorgs.forEach((name,orgid)=>{
      var tlist: TOA[] = [];
       for (var i = 0; i < this.YEARSTOSHOW; i++) {
         var toadata: OneYearToaData = this.toainfo.get(this.pomfy + i);
         tlist.push(
           { year: this.pomfy + i, amount: toadata.orgs.get(orgid).amount }
         );
       }
       otoas[orgid] = tlist;
     });

    var transfer: Pom = {
      communityId: this.community.id,
      communityToas: toas,
      orgToas: otoas,
      fy: this.pomfy
    };

    return transfer;
  }

  submitValue() {
    this.resetCharts();
  }

  onSuborgData(x) {
    this.suborgdata = x;
  }

  submitOrgValue() {
    this.toainfo.set(this.selectedyear, this.suborgdata);
    this.resetSubchart();
  }


  getToaDataOrBlank(year: number): OneYearToaData {
    var orgmap: Map<string, AmountAndBaseline> = new Map<string, AmountAndBaseline>();
    this.toaorgs.forEach((name, orgid) => { 
      orgmap.set(orgid, { amount: 0, baseline: 0 });
    });

    return this.toainfo.get(year) || {
        year: year,
        community: {
          amount: 0,
          baseline: 0
        },
        orgs: orgmap
    };
  }

  resetCharts() {
    var yeartoas: Map<number, number> = new Map<number, number>();

    var totaltoa: number = 0;
    var totalvals: number = 0;

    for (var i = 0; i < this.YEARSTOSHOW; i++) {
      var toadata: OneYearToaData = this.getToaDataOrBlank(this.scrollstartyear + i);
      var newamt: number = toadata.community.amount;
      yeartoas.set(this.scrollstartyear + i, newamt);
      this.createPomSessionService.setCurrentYear(this.pomfy,this.scrollstartyear);
    
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
    for (var i = 0; i < this.YEARSTOSHOW; i++) {
      var toadata: OneYearToaData = this.getToaDataOrBlank(this.scrollstartyear + i);

      var newamt = toadata.community.amount || 0;
      var baseamt: number = toadata.community.baseline || 0;

      var lastamt = (0 === newamt ? baseavg : newamt);
      var pctdiff: number = (i < 1 ? 0 : (lastamt - this.getToaDataOrBlank(this.scrollstartyear + i - 1).community.amount) / lastamt);

      var color: string = '#24527b';
      if (this.scrollstartyear + i < this.pomfy) {
        color = '#277b24';
      }
      if (this.scrollstartyear + i >= this.pomfy + this.BUDGETHORIZON ) {
        color = '#a2aeb9';
      }

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
          (this.scrollstartyear + i < this.pomfy ? ' (Budget)' : '') + "</p><h3 class='tooltip-h3'>TOA:<br> " + "<span>" +
          newamt.toLocaleString() + "</span></h3><h3 class='tooltip-h3'>Baseline: <span>" + baseamt.toLocaleString() + "</span></h3></div>"),
        // STYLE (color)
        color,
        // YOY %
        pctdiff,
        // YOY TOOLTIP
        ("<div class='tool-tip-container'>" +
          "<p class='tooltip-fy'>FY" + (this.scrollstartyear + i - 2000) +
          "</p><h3 class='tooltip-h3'>Change Since FY" + (this.scrollstartyear + i - 2001) + ":<br> " + "<span>" +
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
      this.selectedyear = this.scrollstartyear + event.row;
      this.toayear = this.selectedyear;
      this.createPomSessionService.setCurrentYear(this.toayear,this.scrollstartyear);
      this.analysis_baseline = (1 === event.column);
      this.resetSubchart();
    }
  }

  subselect(event: ChartSelectEvent) {
    if ('deselect' === event.message) {
    }
    else if ('select' === event.message) {
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

    var toadata: OneYearToaData = this.getToaDataOrBlank(this.selectedyear);
    var unallocated: number = toadata.community.amount;
    toadata.orgs.forEach( (amt, orgid)=>{
      var orgname: string = this.orgName(orgid);

      var value = amt.amount || 0;
      var baseamt = amt.baseline || 0;
      charty.push([orgname,
        value,
        value,
        ("<div class='tool-tip-container'>" +
          "<p class='tooltip-fy'>FY" + (this.selectedyear - 2000) +
          "</p><h3 class='tooltip-h3'>TOA:<br> <span class='toa'>" +
          value.toLocaleString() + "</span></h3><h3 class='tooltip-h3'>Baseline: <span class='base'>" + baseamt.toLocaleString() + "</span></h3></div>")
      ]);
      unallocated -= value;
    });

    this.tooMuchToa = (unallocated < 0);

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

      // add a new row for unallocated money
      if (unallocated > 0) {
        charty.push(['Unallocated',
          unallocated,
          unallocated,
          ("<div class='tool-tip-container'>" +
            "<p class='tooltip-fy'>FY" + (this.selectedyear - 2000) +
            "</p><h3 class='tooltip-h3'>Unallocated:<br> <span class='toa'>" +
            unallocated.toLocaleString() + "</span></h3></div>")
        ]);
      }
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

  scroll(years: number) {
    this.scrollstartyear += years;
    var reset: boolean = true;

    // if we don't have the data we need to scroll, get it
    if (!this.toainfo.has(this.scrollstartyear) && this.scrollstartyear < this.pomfy ) {
      // if it's a year in the past, then fetch the data from the budget of that year
      reset = false;
      this.fetchMoreData(this.scrollstartyear);
    }

    this.updateYearsOnScroll=[];
this.scrollLastYear=this.scrollstartyear+4;
for(let i=this.pomfy;i<=this.scrollLastYear;i++){
  this.updateYearsOnScroll.push(i);
}
    if (reset) {
      this.resetCharts();
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

export interface AmountAndBaseline {
  amount: number,
  baseline: number
}

export interface OneYearToaData {
  year: number,
  community: AmountAndBaseline,
  orgs:Map<string, AmountAndBaseline> // org id-> toa data
}