import { Component, OnInit, Input,OnChanges, Output, EventEmitter } from '@angular/core';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { OneYearToaData, AmountAndBaseline } from '../create-pom-session.component';
import { CreatePomSessionService } from '../create-pom-session.service';


@Component({
  selector: 'app-community-modal',
  templateUrl: './community-modal.component.html',
  styleUrls: ['./community-modal.component.scss']
})

export class CommunityModalComponent implements OnInit {
  pomYears: Map<number, OneYearToaData> = new Map<number, OneYearToaData>();
  pomfy: number;

  private BUDGETHORIZON: number = 5; // this is really a constant
  private YEARSTOSHOW: number = 5; // this is really a constant
  private toaorgs: Map<string,string> = new Map<string,string>();
 
  private chartdata;
  private scrollstartyear:number;
  // hide : boolean = flase;
newpomyears: number[] = [];
@Input() private updateYearsOnScroll:number[];
  @Input() private toayear: number;
  @Output() updatedDataEvent = new EventEmitter<string>();
  payload: {};
  // updatedDataEvent1: any;
  @Output() updatedDataEvent1 = new EventEmitter<object>();
  


  constructor(
    public activeModal: NgbActiveModal,
    private createPomSessionService: CreatePomSessionService
  ) { }

  ngOnInit() {
    this.pomYears = this.createPomSessionService.getYears();
    var currentYear_ScrollStart = this.createPomSessionService.getCurrentYear();
    // this.payload = {'year':this.pomYears,}
    console.log(currentYear_ScrollStart,"currentYear_ScrollStart")
    this.pomfy = parseInt(currentYear_ScrollStart.split(",")[0]);
    this.scrollstartyear = parseInt(currentYear_ScrollStart.split(",")[1]);

    if (this.pomfy) {
      // we want to have all years from pomfy to our max TOA year,
      var maxtoayear: number = this.pomfy;
      this.pomYears.forEach((x, year) => {
        if (year > maxtoayear) {
          maxtoayear = year;
        }
      });
      maxtoayear = Math.max(maxtoayear, this.scrollstartyear + this.BUDGETHORIZON - 1);

      for (var y = this.pomfy; y <= maxtoayear; y++) {
        this.newpomyears.push(y);
      }
      return this.newpomyears;
    }
    return [];

  }
  
  sendUpdatedData(pomData) {
    console.log('pom data',pomData);
    this.updatedDataEvent.emit(pomData);
  }
  sendUpdatedData1(payload) {
    console.log('pom payload',payload);
    this.updatedDataEvent1.emit(payload);
  }

  closeModal(){
    var hide = false;
    this.sendUpdatedData(hide);
  }

  getToaDataOrBlank(year: number): OneYearToaData {
    var orgmap: Map<string, AmountAndBaseline> = new Map<string, AmountAndBaseline>();
    this.toaorgs.forEach((name, orgid) => { 
      orgmap.set(orgid, { amount: 0, baseline: 0 });
    });

    return this.pomYears.get(year) || {
        year: year,
        community: {
          amount: 0,
          baseline: 0
        },
        orgs: orgmap
    };
  }

  set toaForYear(val: number) {
    var data: OneYearToaData = this.getToaDataOrBlank(this.toayear);
    data.community.amount = val;
    this.pomYears.set(this.toayear, data);
     console.log('year',this.toayear);
     console.log('amout',val);
     this.payload = {
       'year':this.toayear,
       'amount':this.toaForYear
      };
     console.log("payload",this.payload);

    this.resetCharts();
  }

  get toaForYear(): number {
    if (!this.toayear ){
      return 0;
    }
    return this.getToaDataOrBlank(this.toayear).community.amount;
  }

  submitValue() {
    this.sendUpdatedData1(this.payload);
    this.resetCharts();
  }

  resetCharts() {
    var yeartoas: Map<number, number> = new Map<number, number>();

    var totaltoa: number = 0;
    var totalvals: number = 0;

    for (var i = 0; i < this.YEARSTOSHOW; i++) {
      var toadata: OneYearToaData = this.getToaDataOrBlank(this.pomfy + i);
      var newamt: number = toadata.community.amount;
      yeartoas.set(this.pomfy + i, newamt);
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
      var toadata: OneYearToaData = this.getToaDataOrBlank(this.pomfy + i);

      var newamt = toadata.community.amount || 0;
      var baseamt: number = toadata.community.baseline || 0;

      var lastamt = (0 === newamt ? baseavg : newamt);
      var pctdiff: number = (i < 1 ? 0 : (lastamt - this.getToaDataOrBlank(this.pomfy + i - 1).community.amount) / lastamt);

      var color: string = '#24527b';
      if (this.pomfy + i < this.pomfy) {
        color = '#277b24';
      }
      if (this.pomfy + i >= this.pomfy + this.BUDGETHORIZON ) {
        color = '#a2aeb9';
      }

      charty.push([
        // YEAR
        (this.pomfy + i).toString(),
        // TOA
        (0 === newamt ? baseavg : newamt),
        // ANNOTATION
        (0 === newamt ? baseavg.toLocaleString() + ' (est.)' : newamt.toLocaleString()),
        // TOOLTIP
        ("<div class='tool-tip-container'>" +
          "<p class='tooltip-fy'>FY" + (this.pomfy + i - 2000) +
          (this.pomfy + i < this.pomfy ? ' (Budget)' : '') + "</p><h3 class='tooltip-h3'>TOA:<br> " + "<span>" +
          newamt.toLocaleString() + "</span></h3><h3 class='tooltip-h3'>Baseline: <span>" + baseamt.toLocaleString() + "</span></h3></div>"),
        // STYLE (color)
        color,
        // YOY %
        pctdiff,
        // YOY TOOLTIP
        ("<div class='tool-tip-container'>" +
          "<p class='tooltip-fy'>FY" + (this.pomfy + i - 2000) +
          "</p><h3 class='tooltip-h3'>Change Since FY" + (this.pomfy + i - 2001) + ":<br> " + "<span>" +
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


}