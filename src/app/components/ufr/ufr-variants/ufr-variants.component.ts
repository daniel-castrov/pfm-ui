import { Component, OnInit, Input, ViewChild, OnChanges } from '@angular/core';
import { UFR, FundingLine, POMService, Pom, IntMap} from '../../../generated'
import { FeedbackComponent } from '../../feedback/feedback.component';

@Component({
  selector: 'ufr-variants',
  templateUrl: './ufr-variants.component.html',
  styleUrls: ['./ufr-variants.component.scss']
})
export class UfrVariantsComponent implements OnInit {

  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;
  @Input() current: UFR;
  @Input() editable: boolean = false;

  pomFy:number;
  fund:FundingLine;
  variants:MyVariant[] = [];
  years:string[];

  constructor(private pomService: POMService ) { }

  ngOnInit() {
  }

  ngOnChanges(){
    if(!this.current.phaseId) return; // the parent has not completed it's ngOnInit()
    if ( !this.pomFy ){
      this.setPomFiscalYear();
    }
    if ( this.fund ){
      this.buildTables();
    }
  }

  buildTables(){ 
    //console.log(this.fund);
    let newfund = JSON.parse(JSON.stringify(this.fund));

    this.fund.variants.forEach( variant => {

      let totalq:IntMap = {};
      let myServiceLines:MyServiceLine[] = [];

      variant.serviceLines.forEach( sl => {

        let pbq:IntMap = {};
        let prq:IntMap = {};
        let deltaq:IntMap = {};

        this.years.forEach( year => {
          let num:number=0
          if (sl.quantity[year] &&  !isNaN(sl.quantity[year])  ){
            num = sl.quantity[year];
          }
          pbq[year] = num;
          prq[year] = num;
          deltaq[year] = 0;
          
        });

        let line:MyServiceLine = {
          branch:sl.branch,
          contractor:sl.contractor,
          unitCost:sl.unitCost,
          pbQty:pbq,
          prQty:prq,
          deltaQty:deltaq
        }
        myServiceLines.push(line);        
      });
      this.buildSumColumn(myServiceLines);
      
      let myvariant:MyVariant = {
        shortName: variant.shortName,
        longName: variant.longName,
        serviceLines:myServiceLines,
        totalQty: this.buildSumRow(myServiceLines)
      }
      this.variants.push(myvariant);
    });
    //console.log( this.variants );
  }

  onedit(newval, variant:MyVariant, serviceLine:MyServiceLine, year) {
      var thisyear:number = Number.parseInt(year);
      
      var thisvalue = Number.parseInt(newval.replace(/[^0-9]/g, ''));
      if (''===newval || Number.isNaN(thisvalue)) {
        thisvalue = 0;
      }
      serviceLine.prQty[year] = thisvalue;
      serviceLine.deltaQty[year] = serviceLine.pbQty[year] - serviceLine.prQty[year];
      this.buildSumColumn(variant.serviceLines);
      variant.totalQty = this.buildSumRow(variant.serviceLines);
  }

  buildSumColumn(serviceLines:MyServiceLine[]){
    serviceLines.forEach( sl => {
      sl.pbQty["sum"] = 0 ;
      sl.prQty["sum"] = 0 ;
      sl.deltaQty["sum"] = 0 ;
      this.years.forEach( year => {
          sl.pbQty["sum"] = sl.pbQty["sum"] + sl.pbQty[year];
          sl.prQty["sum"] = sl.prQty["sum"] + sl.prQty[year];
          sl.deltaQty["sum"] = sl.deltaQty["sum"] + sl.deltaQty[year];
      });
    });
  }

  buildSumRow(serviceLines:MyServiceLine[]): IntMap {
    let sum:IntMap = {};
    this.years.forEach( year => sum[year]=0 );
    serviceLines.forEach( sl => {
      this.years.forEach( year => sum[year] = sum[year] + sl.prQty[year] );
    });
    return sum;
  }

  addVariant(){
    let myvariant:MyVariant = {
      shortName: "New Name",
      longName: "New Long Name",
      serviceLines:[],
      totalQty: {}
    }
    this.variants.push(myvariant);
  }

  addServiceLine(variant:MyVariant){
    //console.log(variant);
    variant.serviceLines.push(this.createNewServiceLine());  
  }

  createNewServiceLine():MyServiceLine{
    let pbq:IntMap = {};
    let prq:IntMap = {};
    let deltaq:IntMap = {};

    this.years.forEach( year => {
      pbq[year] = 0;
      prq[year] = 0;
      deltaq[year] = 0;
    });
    pbq["sum"] = 0;
    prq["sum"] = 0;
    deltaq["sum"] = 0;

    let line:MyServiceLine = {
      branch:"Branch",
      contractor:"Contractor",
      unitCost:0,
      pbQty:pbq,
      prQty:prq,
      deltaQty:deltaq
    }
    return line;
  }

  private async setPomFiscalYear() {
    const pom: Pom = (await this.pomService.getById(this.current.phaseId).toPromise()).result;
    this.pomFy = pom.fy-4;
    this.years = [ 
      (this.pomFy).toString(), 
      (this.pomFy+1).toString(), 
      (this.pomFy+2).toString(), 
      (this.pomFy+3).toString(), 
      (this.pomFy+4).toString()
    ];
  }
}

export interface MyVariant {
  shortName: string,
  longName: string,
  serviceLines:MyServiceLine[];
  totalQty: IntMap
}

export interface MyServiceLine {
  branch: string,
  contractor: string,
  unitCost: number,
  pbQty: IntMap,
  prQty: IntMap,
  deltaQty: IntMap,
}
