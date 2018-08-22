import {Component, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import { ProgrammaticRequest, FundingLine, POMService, PBService, PRService, Pom, IntMap, Variant, ServiceLine, User, PB} from '../../../../generated'
import { UserUtils } from '../../../../services/user.utils.service';

import { FeedbackComponent } from '../../../feedback/feedback.component';
import {AgGridNg2} from "ag-grid-angular";
import {DataRow} from "./DataRow";
import {PhaseType} from "../../select-program-request/UiProgrammaticRequest";
import {FormatterUtil} from "../../../../utils/formatterUtil";

@Component({
  selector: 'variants-tab',
  templateUrl: './variants-tab.component.html',
  styleUrls: ['./variants-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VariantsTabComponent {

  @ViewChild("agGrid") private agGrid: AgGridNg2;
  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;
  @Input() current: ProgrammaticRequest;
  @Input() editable:boolean;

  pomFy:number;
  fund:FundingLine;
  myVariants:MyVariant[] = [];

  showAddVariant=false;
  newVariantName:string;
  newVariantDesc:string;

  showAddServiceLine:boolean[]=[];
  newServiceLineBranch:string;
  newServiceLineContractor:string;
  newServiceLineUnitCost:number;

  branches:string[]=["USA","USN","USAF","USMC","USCG","USCG"];

  years:number[];
  columnDefs;
  data;
  pinnedBottomData;
  user: User;

  constructor(private pomService: POMService,
    private pbService: PBService,
    private prService: PRService,
    private globalsService: UserUtils ) { }

  ngOnChanges(){
    if(!this.current.phaseId) return; // the parent has not completed it's ngOnInit()
    this.globalsService.user().subscribe(user => {
      this.user = user;
    });
    this.generateColumns();
  }

  initDataRows(){
    let data: Array<DataRow> = [];
    this.fund.variants.forEach(variant => {
      variant.serviceLines.forEach( sl => {
        let pbRow = new DataRow();
        pbRow.phaseType = PhaseType.PB;
        pbRow.contractor = sl.contractor;
        pbRow.service = sl.branch;
        pbRow.unitCost = sl.unitCost;

        this.pbService.getLatest(this.user.currentCommunityId).subscribe(pb => {
          if(this.current.originalMrId){
            this.prService.getByPhaseAndMrId(pb.result.id, this.current.originalMrId).subscribe(pbPr => {
              pbPr.result.fundingLines.forEach(fl => {
                if (fl.result && fl.result.appropriation === this.fund.appropriation && fl.result.baOrBlin === this.fund.baOrBlin
                  && fl.result.item === this.fund.item && fl.result.opAgency === this.fund.opAgency){
                  fl.result.variants.forEach( pbVariant => {
                    pbVariant.result.serviceLines.forEach( pbSl => {
                      pbRow.quantities = pbSl.result.quantity;
                    });
                  });
                }
              })
            });
          }
        });

        if(!pbRow.quantities) {
          pbRow.quantities = {};
          this.years.forEach(key => {
            pbRow.quantities[key] = 0;
          });
        }
        let pomRow = new DataRow();
        pomRow.phaseType = PhaseType.POM;
        pomRow.quantities = sl.quantity;
        pomRow.contractor = sl.contractor;
        pomRow.service = sl.branch;
        pomRow.unitCost = sl.unitCost;

        let deltaRow = new DataRow();
        deltaRow.phaseType = PhaseType.DELTA;
        deltaRow.quantities = this.generateDelta(pomRow.quantities, pbRow.quantities);
        deltaRow.contractor = sl.contractor;
        deltaRow.service = sl.branch;
        deltaRow.unitCost = sl.unitCost;

        data.push(pbRow);
        data.push(pomRow);
        data.push(deltaRow);
        this.data = data;
      });
    });
  }

  initPinnedBottomRows(){
    let pinnedData = [];
    let pomTotal: IntMap = {};

    this.data.forEach(row => {
      switch(row.phaseType) {
        case PhaseType.POM:
          this.years.forEach(year => {
            pomTotal[year] = (pomTotal[year] || 0) + (isNaN(row.quantities[year]) ? 0 : row.quantities[year]);
          });
          break;
      }
    });

    let pomRow: DataRow = new DataRow();
    pomRow.quantities = pomTotal;
    pomRow.service = 'Totals';
    pomRow.phaseType = PhaseType.POM;
    pinnedData.push(pomRow);

    this.pinnedBottomData = pinnedData;
  }

  generateColumns() {

    this.pomService.getById(this.current.phaseId).subscribe(pom => {
      this.pomFy = pom.result.fy;
      this.years = [this.pomFy, this.pomFy + 1, this.pomFy + 2, this.pomFy + 3, this.pomFy + 4];
      this.columnDefs = [
        {
          headerName: 'Service',
          field: 'service',
          rowSpan: params => {return this.rowSpanCount(params)},
          colSpan: params => {return this.colSpanCount(params)},
          cellClassRules: {
            'row-span': params => {return this.rowSpanCount(params) > 1},
            'text-right': params => {return this.colSpanCount(params) > 1}
          },
          cellClass: 'funding-line-default'
        },
        {
          headerName: 'Contractor',
          field: 'contractor',
          rowSpan: params => {return this.rowSpanCount(params)},
          cellClassRules: {
            'row-span': params => {return this.rowSpanCount(params) > 1}
          },
          cellClass: 'funding-line-default'
        },
        {
          headerName: 'Unit Costs',
          field: 'unitCost',
          valueFormatter: params => {
            return FormatterUtil.currencyFormatter(params)
          },
          rowSpan: params => {return this.rowSpanCount(params)},
          cellClassRules: {
            'row-span': params => {return this.rowSpanCount(params) > 1}
          },
          cellClass: 'funding-line-default'
        },
        {
          headerName: 'Cycle',
          maxWidth: 92,
          valueGetter: params => {
            switch(params.data.phaseType) {
              case PhaseType.POM:
                return params.data.phaseType + (this.pomFy - 2000);
              case PhaseType.PB:
                return params.data.phaseType + (this.pomFy - 2001);
              case PhaseType.DELTA:
                return params.data.phaseType;
            }
          },
          cellClassRules: {
            'delta-row': params => {
              return params.data.phaseType === PhaseType.DELTA;
            }
          }
        }
      ];
      this.years.forEach(year => {
        let colDef = {
          headerName: year,
          field: 'quantities.' + year,
          maxWidth: 92,
          suppressMenu: true,
          suppressToolPanel: true,
          cellClassRules: {
            'ag-cell-edit': params => {
              return this.isAmountEditable(params)
            },
            'delta-row': params => {
              return params.data.phaseType === PhaseType.DELTA;
            }
          },
          valueFormatter: params => {
            return FormatterUtil.numberFormatter(params)
          },
          onCellValueChanged: params => this.onBudgetYearValueChanged(params),
          editable: params => {return this.isAmountEditable(params)}
        };
        this.columnDefs.push(colDef);
      });
      let totalColDef = {
        headerName: 'Total',
        suppressMenu: true,
        suppressToolPanel: true,
        maxWidth: 92,
        type: "numericColumn",
        valueGetter: params => {return this.getTotal(params.data.quantities, this.years)},
        valueFormatter: params => {return FormatterUtil.numberFormatter(params)}
      };
      this.columnDefs.push(totalColDef);
    });
  }

  generateDelta(pomQuantities, pbQuantities): IntMap{
    let deltaQuantities = {};
    this.years.forEach(year => {
      let pomAmount = isNaN(pomQuantities[year])? 0 : pomQuantities[year];
      let pbAmount = isNaN(pbQuantities[year])? 0 : pbQuantities[year];
      let total =  pomAmount - pbAmount;
      deltaQuantities[year]= total;
    });
    return deltaQuantities;
  }

  rowSpanCount(params): number {
    if (params.data.phaseType === PhaseType.PB) {
      return 3;
    } else {
      return 1;
    }
  }

  colSpanCount(params): number {
    if (params.data.service === 'Totals') {
      return 4;
    } else {
      return 1;
    }
  }

  isAmountEditable(params): boolean{
    return params.data.phaseType == PhaseType.POM && params.data.service !== 'Totals';
  }

  getTotal(quantities, years): number {
    let result = 0;
    years.forEach(year => {
      let amount = Number(quantities[year]);
      result += isNaN(amount)? 0 : amount;
    });
    return result;
  }

  onBudgetYearValueChanged(params){
    let year = params.colDef.headerName;
    let pomNode = params.data;
    pomNode.quantities[year] = Number(params.newValue);
    let displayModel = this.agGrid.api.getModel();
    let pbNode = displayModel.getRow(params.node.rowIndex - 1);
    if (pbNode !== undefined && pbNode.data.phaseType === PhaseType.PB) {
      let deltaNode = displayModel.getRow(params.node.rowIndex + 1);
      deltaNode.data.quantities = this.generateDelta(pomNode.quantities, pbNode.data.quantities);
    }
    this.agGrid.api.refreshCells();
  }

  buildTables(){
    this.initDataRows();
    this.initPinnedBottomRows();
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

    if(!this.current.originalMrId) return;
    const pbPr: ProgrammaticRequest = (await this.prService.getByPhaseAndMrId(pb.id, this.current.originalMrId).toPromise()).result;

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

    if (this.myVariants.filter(vari => (vari.shortName === this.newVariantName)).length > 0 ){
      this.feedback.failure('A Variant named "' + this.newVariantName + '" already exists');
      return;
    }

    let myvariant:MyVariant = {
      shortName: this.newVariantName,
      number: this.getNextVariantNumber(),
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

  getNextVariantNumber(): number {
    let n=0;
    this.myVariants.forEach( variant => {
      if ( variant.number > n ) n = variant.number;
    })
    return n+1;
  }

  deleteVariant( myvariant:MyVariant ){
    let myIndex = this.myVariants.findIndex( variant => variant.shortName === myvariant.shortName );
    this.myVariants.splice(myIndex,1);

    let index = this.fund.variants.findIndex( variant => variant.shortName === myvariant.shortName );
    this.fund.variants.splice(index,1);

  }

  addServiceLine(myVariant:MyVariant, variantNumber:number){

    if (myVariant.serviceLines.filter(sl =>
        (sl.branch === this.newServiceLineBranch && sl.contractor ===  this.newServiceLineContractor && sl.unitCost === this.newServiceLineUnitCost)
      ).length > 0 ){
      this.feedback.failure('Service Line already exists');
      return;
    }

    myVariant.serviceLines.push(
      this.createNewMyServiceLine(this.newServiceLineBranch, this.newServiceLineContractor, this.newServiceLineUnitCost)
    );

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

  toggleShowAddVariance(){
    this.showAddVariant = !this.showAddVariant;
  }

  toggleShowAddServiceLine(variantNumber:number){
    for (let i=0; i<this.showAddServiceLine.length; i++ ){
      if (i != variantNumber)
      this.showAddServiceLine[i]=false;
    }
    this.showAddServiceLine[variantNumber]=!this.showAddServiceLine[variantNumber];
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
