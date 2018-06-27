import { Component, OnInit, Input, ViewChild, OnChanges } from '@angular/core';
import { ProgrammaticRequest, FundingLine, POMService, PBService, PRService, 
  Pom, IntMap, Variant, ServiceLine, User, PB} from '../../../../generated'
import { GlobalsService } from '../../../../services/globals.service';

import { FeedbackComponent } from '../../../feedback/feedback.component';
import { WSAEPROVIDERFAILEDINIT } from 'constants';
import { ElementInstructionMap } from '@angular/animations/browser/src/dsl/element_instruction_map';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'variants-tab',
  templateUrl: './variants-tab.component.html',
  styleUrls: ['./variants-tab.component.scss']
})
export class VariantsTabComponent implements OnInit {

  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;
  @Input() pr: ProgrammaticRequest;

  pomFy:number;
  fund:FundingLine;
  variants:MyVariant[] = [];
  years:string[];

  constructor(private pomService: POMService, 
    private pbService: PBService,
    private prService: PRService,
    private globalsService: GlobalsService ) { }

  ngOnInit() {
  }

  ngOnChanges(){
    if(!this.pr.phaseId) return; // the parent has not completed it's ngOnInit()    
    this.setYears();
  }

  buildTables(){ 

    this.variants = [];
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
          pbq[year] = 0;
          prq[year] = num;
          deltaq[year] = 0;
        });

        let line:MyServiceLine = {
          branch: sl.branch,
          contractor: sl.contractor,
          unitCost: sl.unitCost,
          pbQty: pbq,
          prQty: prq,
          deltaQty: deltaq
        }
        myServiceLines.push(line);        
      });
      this.buildSumColumn(myServiceLines);
      
      let myvariant:MyVariant = {
        shortName: variant.shortName,
        longName: variant.longName,
        serviceLines: myServiceLines,
        totalQty: this.buildSumRow(myServiceLines)
      }
      this.variants.push(myvariant);
    });
    this.setPbQty();
  }

  private async setPbQty() {
    const user: User = await this.globalsService.user().toPromise();
    const pb: PB = (await this.pbService.getLatest(user.currentCommunityId).toPromise()).result;
    let pbFy = pb.fy;

    if(!this.pr.originalMrId) return;
    const pbPr: ProgrammaticRequest = (await this.prService.getByPhaseAndMrId(pb.id, this.pr.originalMrId).toPromise()).result;

    let thePbFund:FundingLine; 
    pbPr.fundingLines.forEach(fl => {
      if (  fl.appropriation === this.fund.appropriation && fl.blin === this.fund.blin
            && fl.item === this.fund.item && fl.opAgency === this.fund.opAgency){ 
        thePbFund=fl; 
      }
    });

    if (!thePbFund) return;

    let serLines: Map<string, ServiceLine> = new Map<string, ServiceLine>();
    thePbFund.variants.forEach( pbVrnt => {
      pbVrnt.serviceLines.forEach( sl => {
        let key = pbVrnt.shortName+sl.branch+sl.contractor+sl.unitCost;
        serLines.set(key,sl);        
      });
    });

    this.variants.forEach( vrnt => 
      vrnt.serviceLines.forEach( sl => {
        let key = vrnt.shortName+sl.branch+sl.contractor+sl.unitCost;
        this.years.forEach( year => {
          let num:number=0
          if (serLines.get( key ).quantity[year] &&  !isNaN(serLines.get( key ).quantity[year])  ){
            num = serLines.get( key ).quantity[year];
          }
          sl.pbQty[year] = num;
          sl.deltaQty[year] = sl.prQty[year] - sl.pbQty[year];
        });
      })
    );
  }

  onedit(newval, myVariant:MyVariant, myServiceLine:MyServiceLine, year) {
      var thisyear:number = Number.parseInt(year);
      
      var cleanValue = Number.parseInt(newval.replace(/[^0-9]/g, ''));
      if (''===newval || Number.isNaN(cleanValue)) {
        cleanValue = 0;
      }
      myServiceLine.prQty[year] = cleanValue;
      myServiceLine.deltaQty[year] = myServiceLine.prQty[year] - myServiceLine.pbQty[year];
      this.buildSumColumn(myVariant.serviceLines);
      myVariant.totalQty = this.buildSumRow(myVariant.serviceLines);

      //finally update the actual variants and servicelines
      this.saveToThisFund(cleanValue, myVariant, myServiceLine, year);

  }

  saveToThisFund(newval, myVariant:MyVariant, mySl:MyServiceLine, year){
    this.fund.variants.forEach( variant => {
      if ( variant.longName === myVariant.longName ){
        variant.serviceLines.forEach( sl => {
          if ( sl.branch === mySl.branch && sl.contractor === mySl.contractor && sl.unitCost === mySl.unitCost ){
            sl.quantity[year] = newval;
            return;
          }
        });
      }
    });
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

    let variant:Variant = {
      shortName:myvariant.shortName,
      longName:myvariant.longName,
      serviceLines:[]
    }
    this.fund.variants.push(variant);
  }

  addServiceLine(myVariant:MyVariant){
    let branch="Branch";
    let contractor="Contractor";
    let unitCost=0;

    myVariant.serviceLines.push(this.createNewMyServiceLine(branch, contractor, unitCost));

    this.fund.variants.forEach( variant => {
      if ( variant.longName === myVariant.longName ){
        variant.serviceLines.push( this.createNewServiceLine(branch, contractor, unitCost) );
        return;
      }
    });
  }

  createNewServiceLine(brnch:string, cntrctr:string, utCst:number): ServiceLine{
    let sl:ServiceLine = {
      branch:brnch,
      contractor:cntrctr,
      unitCost:utCst,
      quantity:{}
    }
    return sl;
  }

  createNewMyServiceLine(brnch:string, cntrctr:string, utCst:number):MyServiceLine{
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
      branch:brnch,
      contractor:cntrctr,
      unitCost:utCst,
      pbQty:pbq,
      prQty:prq,
      deltaQty:deltaq
    }
    return line;
  }

  private async setYears() {
    const pom: Pom = (await this.pomService.getById(this.pr.phaseId).toPromise()).result;
    this.pomFy = pom.fy-4;
    this.years = [ (this.pomFy).toString(), (this.pomFy+1).toString(), 
      (this.pomFy+2).toString(), (this.pomFy+3).toString(), (this.pomFy+4).toString()
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