import {Component, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import { ProgrammaticRequest, FundingLine, POMService, PBService, PRService, Pom, IntMap, Variant, ServiceLine, User, PB} from '../../../../generated'
import { UserUtils } from '../../../../services/user.utils';
import { Notify } from '../../../../utils/Notify';

import {DataRow} from "./DataRow";
import {PhaseType} from "../../select-program-request/UiProgrammaticRequest";
import {FormatterUtil} from "../../../../utils/formatterUtil";
import {ColumnApi, GridApi} from "ag-grid";
import {DeleteRenderer} from "../../../renderers/delete-renderer/delete-renderer.component";

@Component({
  selector: 'variants-tab',
  templateUrl: './variants-tab.component.html',
  styleUrls: ['./variants-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VariantsTabComponent {

  @Input() current: ProgrammaticRequest;
  @Input() editable:boolean;

  pomStatus: Pom.StatusEnum;
  pomFy:number;
  fund:FundingLine = null;
  fundsAvailable:string = null;

  showAddVariant=false;
  newVariantName:string;

  branches:string[]=["USA","USN","USAF","USMC","SOCOM","NGB"];

  years:number[];
  columnDefs;
  data: Map<string, Array<DataRow>> = new Map();
  pinnedBottomData: Map<string, Array<DataRow>> = new Map();
  user: User;
  gridApi: Map<string, GridApi> = new Map();
  columnApi: Map<string, ColumnApi> = new Map();
  isVariantsTabValid: any[] = [];
  frameworkComponents = {deleteRenderer: DeleteRenderer};
  context = {parentComponent: this};

  constructor(private pomService: POMService,
    private pbService: PBService,
    private prService: PRService,
    private globalsService: UserUtils ) { }

  ngOnChanges(){
    if(!this.current.phaseId) return; // the parent has not completed it's ngOnInit()
    this.globalsService.user().subscribe(user => {
      this.user = user;
    });
    if(!this.columnDefs) {
      this.generateColumns();
    }
    this.determineProcWithoutVariant();
  }

  determineProcWithoutVariant(){
    let procTotal:number = 0;
    let variantCount:number = 0;
    this.procFundingLines().forEach(fl => {
      Object.keys(fl.funds).forEach(key => procTotal += fl.funds[key] );
      variantCount += fl.variants.length;
    });
    if ( procTotal > 0 && variantCount ==0 ) {
      let message:string="This PR has Procurement Funds but no Variants.";
      this.fundsAvailable = message;
      Notify.info(message);
    }
  }

  initData(){
    this.fundsAvailable=null;
    this.initDataRows();
    this.initPinnedBottomRows();
  }

  procFundingLines(): FundingLine[] {
    return this.current.fundingLines.filter(fl => fl.appropriation === "PROC");
  }

  async initDataRows(){

    let pbPr:ProgrammaticRequest;

    if( this.current.originalMrId ){
      let pb = (await this.pbService.getLatest(this.user.currentCommunityId).toPromise()).result;
      pbPr = (await this.prService.getByPhaseAndMrId(pb.id, this.current.originalMrId).toPromise()).result;
    }

    this.fund.variants.forEach(variant => {
      let data: Array<DataRow> = [];
      variant.serviceLines.forEach( sl => {
        let pbRow = new DataRow();
        pbRow.phaseType = PhaseType.PB;
        pbRow.serviceLine = {
          contractor: sl.contractor,
          branch: sl.branch,
          unitCost: sl.unitCost,
          bulkOrigin: sl.bulkOrigin
        };
        pbRow.variantName = variant.shortName;

        if  ( pbPr ) {
          pbPr.fundingLines.forEach(fl => {
            if (fl && fl.appropriation === this.fund.appropriation && fl.baOrBlin === this.fund.baOrBlin
              && fl.item === this.fund.item && fl.opAgency === this.fund.opAgency){
                
              fl.variants.forEach( pbVariant => {
                pbVariant.serviceLines.forEach( pbSl => {
                  pbRow.serviceLine.quantity = pbSl.quantity;
                });
              });
            }
          })
        }

        if( !pbRow.serviceLine.quantity ) {
          pbRow.serviceLine.quantity = {};
          this.years.forEach(key => {
            pbRow.serviceLine.quantity[key] = 0;
          });
        }

        let pomRow = new DataRow();
        pomRow.phaseType = PhaseType.POM;
        pomRow.serviceLine = {
          contractor: sl.contractor,
          branch: sl.branch,
          unitCost: sl.unitCost,
          bulkOrigin: sl.bulkOrigin,
          quantity: sl.quantity
        };
        pomRow.variantName = variant.shortName;

        let deltaRow = new DataRow();
        deltaRow.phaseType = PhaseType.DELTA;
        deltaRow.serviceLine = {
          contractor: sl.contractor,
          branch: sl.branch,
          unitCost: sl.unitCost,
          bulkOrigin: sl.bulkOrigin
        };
        deltaRow.serviceLine.quantity = this.generateDelta(pomRow.serviceLine.quantity, pbRow.serviceLine.quantity);
        deltaRow.variantName = variant.shortName;

        data.push(pbRow);
        data.push(pomRow);
        data.push(deltaRow);
      });
      this.data.set(variant.shortName, data);
    });

  }

  initPinnedBottomRows(){
    this.data.forEach((value: DataRow[], key: string) => {
      let pinnedData = [];
      let pomTotal: IntMap = {};

      this.years.forEach(year => { pomTotal[year] = 0 });

      value.forEach(row => {
        if (row.phaseType == PhaseType.POM ) {
          this.years.forEach(year => {
            pomTotal[year] =  (pomTotal[year] || 0) 
                              + (isNaN(row.serviceLine.quantity[year]) ? 0 : row.serviceLine.quantity[year]);
          });
        }
      });
      let pomRow: DataRow = new DataRow();
      pomRow.serviceLine = {quantity: pomTotal, branch: 'Totals'};
      pomRow.phaseType = PhaseType.POM;
      pinnedData.push(pomRow);

      this.pinnedBottomData.set(key, pinnedData);
      if(this.gridApi.get(key)){
        this.gridApi.get(key).setPinnedBottomRowData(pinnedData);
      }
    });
  }

  generateColumns() {
    this.pomService.getById(this.current.phaseId).subscribe(pom => {
      this.pomStatus = pom.result.status;
      this.pomFy = pom.result.fy;
      this.years = [this.pomFy, this.pomFy + 1, this.pomFy + 2, this.pomFy + 3, this.pomFy + 4];
      this.columnDefs = [
        {
          headerName: '',
          colId: 'delete',
          suppressToolPanel: true,
          hide: true,
          cellRenderer: 'deleteRenderer',
          rowSpan: params => {return this.rowSpanCount(params)},
          cellClassRules: {
            'font-weight-bold': params => {return this.colSpanCount(params) > 1},
            'row-span': params => {return this.rowSpanCount(params) > 1}
          },
          cellClass: 'funding-line-default',
          cellStyle: {'text-align': 'center'},
          width: 50
        },
        {
          headerName: 'Service',
          field: 'serviceLine.branch',
          editable: params => {
            return this.isEditable(params)
          },
          rowSpan: params => {return this.rowSpanCount(params)},
          colSpan: params => {return this.colSpanCount(params)},
          cellClassRules: {
            'row-span': params => {return this.rowSpanCount(params) > 1},
            'text-right': params => {return this.colSpanCount(params) > 1}
          },
          onCellValueChanged: params => this.onServiceLineValueChanged(params),
          cellClass: 'funding-line-default',
          cellEditorSelector: params => {
            return {
              component: 'agSelectCellEditor',
              params: {values: this.branches}
            };
          }
        },
        {
          headerName: 'Contractor',
          field: 'serviceLine.contractor',
          editable: params => {
            return this.isEditable(params)
          },
          rowSpan: params => {return this.rowSpanCount(params)},
          cellClassRules: {
            'row-span': params => {return this.rowSpanCount(params) > 1}
          },
          onCellValueChanged: params => this.onServiceLineValueChanged(params),
          cellClass: 'funding-line-default'
        },
        {
          headerName: 'Unit Costs ($)',
          field: 'serviceLine.unitCost',
          valueFormatter: params => {
            return FormatterUtil.currencyFormatter(params, 2)
          },
          editable: params => {
            return this.isEditable(params)
          },
          rowSpan: params => {return this.rowSpanCount(params)},
          cellClassRules: {
            'row-span': params => {return this.rowSpanCount(params) > 1}
          },
          onCellValueChanged: params => this.onServiceLineValueChanged(params),
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
      let childrens = [];
      this.years.forEach(year => {
        let colDef = {
          headerName: "FY" + (year-2000),
          colId:year,
          field: 'serviceLine.quantity.' + year,
          maxWidth: 92,
          suppressMenu: true,
          suppressToolPanel: true,
          cellClass: 'text-right',
          cellClassRules: {
            'ag-cell-edit': params => {
              return this.isAmountEditable(params)
            },
            'delta-row': params => {
              return params.data.phaseType === PhaseType.DELTA;
            }
          },
          cellStyle: params => {
            if (params.data.phaseType === PhaseType.POM && !this.isServiceLineValid(year)) {
              return {color: 'red'};
            }else {
              return {color: 'black'};
            }
          },
          valueFormatter: params => {
            return FormatterUtil.numberFormatter(params)
          },
          onCellValueChanged: params => this.onBudgetYearValueChanged(params),
          editable: params => {return this.isAmountEditable(params)}
        };
        childrens.push(colDef);
      });

      let totalColDef = {
        headerName: 'Total',
        suppressMenu: true,
        suppressToolPanel: true,
        maxWidth: 92,
        type: "numericColumn",
        valueGetter: params => {return this.getTotal(params.data.serviceLine.quantity, this.years)},
        valueFormatter: params => {return FormatterUtil.numberFormatter(params)}
      };
      childrens.push(totalColDef);
      let colDef = {
        headerName: 'Quantities',
        suppressMenu: true,
        suppressToolPanel: true,
        cellClass: ['text-center'],
        children: childrens
      };
      this.columnDefs.push(colDef);
    });
  }

  isEditable(params): boolean{
    return params.data.serviceLine.branch !== 'Totals' && params.data.serviceLine.bulkOrigin === undefined && params.data.phaseType === PhaseType.PB
  }

  delete(index, data) {
    let variant = this.fund.variants.find(variant => variant.shortName === data.variantName);
    variant.serviceLines.splice(variant.serviceLines.findIndex(sl =>
      sl.branch === this.data.get(variant.shortName)[index + 1].serviceLine.branch &&
      sl.contractor === this.data.get(variant.shortName)[index + 1].serviceLine.contractor &&
      sl.unitCost === this.data.get(variant.shortName)[index + 1].serviceLine.unitCost), 1)
    this.data.get(variant.shortName).splice(index, 3);
    this.gridApi.get(variant.shortName).setRowData(this.data.get(variant.shortName));

    this.initPinnedBottomRows();
    if (!this.data.get(variant.shortName).some(row => row.serviceLine.bulkOrigin !== true)) {
      this.columnApi.get(variant.shortName).setColumnVisible('delete', false);
      this.gridApi.get(variant.shortName).sizeColumnsToFit();
    }
  }

  addRow(shortName){
    let newPbRow: DataRow = new DataRow();
    newPbRow.phaseType = PhaseType.PB;
    newPbRow.serviceLine = {
      branch: '',
      contractor: '',
      unitCost: 0,
      quantity: this.generateEmptyQuantities()
    };
    newPbRow.variantName = shortName;

    let newPomRow: DataRow = new DataRow();
    newPomRow.phaseType = PhaseType.POM;
    newPomRow.serviceLine = {
      branch: '',
      contractor: '',
      unitCost: 0,
      quantity: this.generateEmptyQuantities()
    };
    newPomRow.variantName = shortName;


    let newDeltaRow: DataRow = new DataRow();
    newDeltaRow.serviceLine = {
      branch: '',
      contractor: '',
      unitCost: 0,
      quantity: this.generateDelta(newPomRow.serviceLine.quantity, newPbRow.serviceLine.quantity)
    };
    newDeltaRow.phaseType = PhaseType.DELTA;
    newDeltaRow.variantName = shortName;

    this.fund.variants.find(variant => variant.shortName === shortName).serviceLines.push(newPomRow.serviceLine);
    this.data.get(shortName).push(newPbRow);
    this.data.get(shortName).push(newPomRow);
    this.data.get(shortName).push(newDeltaRow);
    this.columnApi.get(shortName).setColumnVisible('delete', true);
    this.gridApi.get(shortName).sizeColumnsToFit();
    this.gridApi.get(shortName).setRowData(this.data.get(shortName));
    this.gridApi.get(shortName).setFocusedCell(this.data.get(shortName).length - 3, 'serviceLine.branch');
    this.gridApi.get(shortName).startEditingCell({rowIndex: this.data.get(shortName).length - 3, colKey: 'serviceLine.branch'});
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
    if (params.data.serviceLine.branch === 'Totals') {
      return 4;
    } else {
      return 1;
    }
  }

  isAmountEditable(params): boolean{
    return params.data.phaseType == PhaseType.POM && params.data.serviceLine.branch !== 'Totals';
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

    if ( Number(params.newValue) < 0 ){
      params.newValue = params.oldValue;
      Notify.warning( "You cannot request negative quantities." );
    } 
    let year = params.colDef.colId;
    let pomNode = params.data;
    pomNode.serviceLine.quantity[year] = Number(params.newValue);
    let displayModel = this.gridApi.get(params.data.variantName).getModel();
    let pbNode = displayModel.getRow(params.node.rowIndex - 1);
    if (pbNode !== undefined && pbNode.data.phaseType === PhaseType.PB) {
      let deltaNode = displayModel.getRow(params.node.rowIndex + 1);
      deltaNode.data.serviceLine.quantity = this.generateDelta(pomNode.serviceLine.quantity, pbNode.data.serviceLine.quantity);
    }
    this.gridApi.get(params.data.variantName).refreshCells();
    this.initPinnedBottomRows();
    this.isVariantsTabValid[year] = (Pom.StatusEnum.RECONCILIATION === this.pomStatus ? true : this.isServiceLineValid(year) );
  }

  onServiceLineValueChanged(params) {
    let pomNode = this.data.get(params.data.variantName)[params.node.rowIndex + 1];
    pomNode.serviceLine.branch = params.data.serviceLine.branch;
    pomNode.serviceLine.contractor = params.data.serviceLine.contractor;
    pomNode.serviceLine.unitCost = params.data.serviceLine.unitCost;
    pomNode.serviceLine.bulkOrigin = false;
    this.gridApi.get(params.data.variantName).refreshCells();
  }

  onGridReady(params, variant) {
    setTimeout(() => {
      this.columnApi.set(variant.shortName, params.columnApi);
      this.gridApi.set(variant.shortName, params.api);
      this.gridApi.get(variant.shortName).setRowData(this.data.get(variant.shortName));
      this.gridApi.get(variant.shortName).setPinnedBottomRowData(this.pinnedBottomData.get(variant.shortName));
      if (this.data.get(variant.shortName).some(row => row.serviceLine.bulkOrigin !== true)) {
        this.columnApi.get(variant.shortName).setColumnVisible('delete', true);
      }
      setTimeout(() => {
        this.gridApi.get(variant.shortName).sizeColumnsToFit();
      }, 100)

    }, 300);

    window.addEventListener("resize", () => {
      setTimeout(() => {
        this.gridApi.get(variant.shortName).sizeColumnsToFit();
      });
    });
  }

  isServiceLineValid(year): boolean{
    let newAmount = 0;
    let flAmount = isNaN(this.fund.funds[year])? 0 : this.fund.funds[year];
    this.fund.variants.forEach(variant => {
      variant.serviceLines.forEach(serviceLine => {
        if (serviceLine.quantity && serviceLine.quantity[year] !== undefined && !isNaN(serviceLine.quantity[year])){
          newAmount += Number(serviceLine.quantity[year]) * Number(serviceLine.unitCost);
        }
      })
    });
    return newAmount <= (flAmount * 1000);
  }

  generateEmptyQuantities(): IntMap {
    let quantities:IntMap = {};

    this.years.forEach( year => {
      quantities[year] = 0;
    });
    return JSON.parse(JSON.stringify(quantities));
  }

  addVariant(){
    if (this.fund.variants.filter(vari => (vari.shortName === this.newVariantName)).length > 0 ){
      Notify.error('A Variant named "' + this.newVariantName + '" already exists');
      return;
    }

    let variant:Variant = {
      shortName: this.newVariantName,
      number: this.getNextVariantNumber(),
      bulkOrigin:false,
      serviceLines:[]
    }
    this.fund.variants.push(variant);

    this.initData();

    this.showAddVariant=false;
    this.newVariantName=null;
  }

  getNextVariantNumber(): number {
    let n=0;
    this.fund.variants.forEach( variant => {
      if ( variant.number > n ) n = variant.number;
    })
    return n+1;
  }

  deleteVariant(index){
    this.fund.variants.splice(index,1);

  }

  toggleShowAddVariance(){
    this.showAddVariant = !this.showAddVariant;
  }

  get invalid(): boolean {
    return this.isVariantsTabValid.some(valid => valid === false);
  }
}
