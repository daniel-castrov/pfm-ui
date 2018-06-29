import { Component, OnInit, Input, ViewChild, OnChanges } from '@angular/core';
import { ProgrammaticRequest, FundingLine, POMService, PBService, PRService, 
  Pom, IntMap, Variant, ServiceLine, User, PB} from '../../../../generated'
import { GlobalsService } from '../../../../services/globals.service';

import { FeedbackComponent } from '../../../feedback/feedback.component';
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
  myVariants:MyVariant[] = [];
  years:string[];

  showAddVariant=false;
  newVariantName:string;
  newVariantDesc:string;

  showAddServiceLine:boolean[]=[];
  newServiceLineBranch:string;
  newServiceLineContractor:string;
  newServiceLineUnitCost:number;

  branches:string[]=["USA","USN","USAF","USMC","USCG","USCG"];

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

    this.myVariants = [];
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
          bulkOrigin:sl.bulkOrigin,
          pbQty: pbq,
          prQty: prq,
          deltaQty: deltaq
        }
        myServiceLines.push(line);        
      });
      this.buildSumColumn(myServiceLines);
      
      let myvariant:MyVariant = {
        shortName: variant.shortName,
        number: variant.number,
        bulkOrigin: variant.bulkOrigin,
        serviceLines: myServiceLines,
        totalQty: this.buildSumRow(myServiceLines)
      }
      this.myVariants.push(myvariant);
      this.showAddServiceLine.push(false);
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
      if (  fl.appropriation === this.fund.appropriation && fl.baOrBlin === this.fund.baOrBlin
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

    this.myVariants.forEach( vrnt => 
      vrnt.serviceLines.forEach( sl => {
        let key = vrnt.shortName+sl.branch+sl.contractor+sl.unitCost;
        this.years.forEach( year => {
          let num:number=0
          if ( serLines.get( key ) && serLines.get( key ).quantity[year] &&  !isNaN(serLines.get( key ).quantity[year])  ){
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
      if ( variant.number === myVariant.number ){
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
      shortName: this.newVariantName,
      number: 1,
      bulkOrigin:false,
      serviceLines:[],
      totalQty: {}
    }
    this.myVariants.push(myvariant);

    let variant:Variant = {
      shortName:myvariant.shortName,
      number:myvariant.number,
      bulkOrigin:false,
      serviceLines:[]
    }
    this.fund.variants.push(variant);

    this.showAddVariant=false;
    this.newVariantName=null;
    this.newVariantDesc=null;

  }

  deleteVariant( myvariant:MyVariant ){
    console.log(myvariant.shortName);

    let myIndex = this.myVariants.findIndex( variant => variant.shortName === myvariant.shortName );
    this.myVariants.splice(myIndex,1);

    let index = this.fund.variants.findIndex( variant => variant.shortName === myvariant.shortName );
    this.fund.variants.splice(index,1);

  }

  addServiceLine(myVariant:MyVariant, variantNumber:number){
  
    console.log(this.newServiceLineBranch, this.newServiceLineContractor, this.newServiceLineUnitCost);
    
    myVariant.serviceLines.push(this.createNewMyServiceLine(this.newServiceLineBranch, this.newServiceLineContractor, this.newServiceLineUnitCost));

    this.fund.variants.forEach( variant => {
      if ( variant.number === myVariant.number &&  variant.shortName === myVariant.shortName ){
        variant.serviceLines.push( this.createNewServiceLine(this.newServiceLineBranch, this.newServiceLineContractor, this.newServiceLineUnitCost) );
        return;
      }
    });
    this.toggleShowAddServiceLine(variantNumber);

    this.newServiceLineBranch=null;
    this.newServiceLineContractor=null;
    this.newServiceLineUnitCost=null;
  }

  deleteServiceLine( myVa:MyVariant, mySl:MyServiceLine){

    let myVIndex = this.myVariants.findIndex( variant => variant.shortName === myVa.shortName );
    let mySLIndex = this.myVariants[myVIndex].serviceLines.findIndex( msl => 
      msl.branch === mySl.branch && msl.contractor === mySl.contractor && msl.unitCost === mySl.unitCost 
    );
    this.myVariants[myVIndex].serviceLines.splice(mySLIndex,1);

    let vIndex = this.fund.variants.findIndex( variant => variant.shortName === myVa.shortName );
    let slIndex = this.fund.variants[vIndex].serviceLines.findIndex( sl => 
      sl.branch === mySl.branch && sl.contractor === mySl.contractor && sl.unitCost === mySl.unitCost 
    );
    this.fund.variants[myVIndex].serviceLines.splice(slIndex,1);

  }

  createNewServiceLine(brnch:string, cntrctr:string, utCst:number): ServiceLine{
    let sl:ServiceLine = {
      branch:brnch,
      contractor:cntrctr,
      unitCost:utCst,
      bulkOrigin:false,
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
      bulkOrigin:false,
      pbQty:pbq,
      prQty:prq,
      deltaQty:deltaq
    }
    return line;
  }

  toggleShowAddServiceLine(variantNumber:number){
    for (let i=0; i<this.showAddServiceLine.length; i++ ){
      if (i != variantNumber)
      this.showAddServiceLine[i]=false;
    }
    this.showAddServiceLine[variantNumber]=!this.showAddServiceLine[variantNumber];
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
  number: number,
  bulkOrigin: boolean,
  serviceLines:MyServiceLine[];
  totalQty: IntMap
}

export interface MyServiceLine {
  branch: string,
  contractor: string,
  unitCost: number,
  bulkOrigin: boolean,
  pbQty: IntMap,
  prQty: IntMap,
  deltaQty: IntMap,
}