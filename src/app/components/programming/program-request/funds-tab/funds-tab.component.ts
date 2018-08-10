import { TagsService } from '../../../../services/tags.service';
import { ProgrammaticRequest } from '../../../../generated/model/programmaticRequest';
import { ProgramType } from '../../../../generated/model/programType';
import { PRUtils } from '../../../../services/pr.utils.service';
import { AutoValuesService } from './AutoValues.service';
import { FeedbackComponent } from '../../../feedback/feedback.component';
import { User } from '../../../../generated/model/user';
import { UserUtils } from '../../../../services/user.utils.service';
import { PB } from '../../../../generated/model/pB';
import {Component, Input, OnChanges, ViewChild, OnInit, ViewEncapsulation} from '@angular/core'
import {FundingLine, POMService, Pom, PRService, PBService, CreationTimeType, IntMap} from '../../../../generated'
import {AgGridNg2} from "ag-grid-angular";
import {DataRow} from "./DataRow";
import {PhaseType} from "../../select-program-request/UiProgrammaticRequest";

@Component({
  selector: 'funds-tab',
  templateUrl: './funds-tab.component.html',
  styleUrls: ['./funds-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FundsTabComponent implements OnChanges {

  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;
  @ViewChild("agGrid") private agGrid: AgGridNg2;
  @Input() private pr: ProgrammaticRequest;
  private parentPr: ProgrammaticRequest;
  @Input() private prs: ProgrammaticRequest[];
  @Input() private isValid: boolean;

  private pomFy: number;
  private pbFy: number;

  // for the add FL section
  private appropriations: string[] = [];
  private baOrBlins: string[] = [];
  private filteredBlins: string[] = [];
  private columnKeys;
  public columnDefs = [];
  public data;
  public pinnedBottomData;

  constructor(private pomService: POMService,
              private pbService: PBService,
              private prService: PRService,
              private globalsService: UserUtils,
              private tagsService: TagsService,
              private autoValuesService: AutoValuesService ) {}

  async ngOnChanges() {
    if(!this.pr.phaseId) {
      return;
    }
    this.setPomFiscalYear();
    this.initDataRows();
    if(this.pr.type === ProgramType.GENERIC && this.pr.creationTimeType === CreationTimeType.SUBPROGRAM_OF_PR_OR_UFR) {
      this.parentPr = (await this.prService.getById(this.pr.creationTimeReferenceId).toPromise()).result
    }
  }

  initDataRows(){
    let data: Array<DataRow> = [];
    this.getPBData().then(value => {
      let pbPr = value;
      this.pr.fundingLines.forEach(fundingLine => {
        let pomRow: DataRow = {fundingLine: fundingLine, phaseType: PhaseType.POM}
        let pbRow: DataRow = new DataRow();

        if(pbPr !== undefined) {
          pbRow.fundingLine = pbPr.fundingLines.filter(fl =>
            fundingLine.appropriation === fl.appropriation &&
            fundingLine.opAgency === fl.opAgency &&
            fundingLine.baOrBlin === fl.baOrBlin &&
            fundingLine.item === fl.item
          )[0];
          pbRow.phaseType = PhaseType.PB;
        }

        if (pbRow.fundingLine !== undefined && this.isPbFunded(pbRow.fundingLine.funds)) {
          let deltaRow: DataRow = new DataRow();
          deltaRow.fundingLine= this.generateDelta(pomRow.fundingLine, pbRow.fundingLine);
          deltaRow.phaseType = PhaseType.DELTA;
          data.push(pbRow);
          data.push(pomRow);
          data.push(deltaRow);
        } else {
          data.push(pomRow);
        }
      });
      this.generateColumns(this.pr.fundingLines);
      this.data = data;
      this.initPinnedBottomRows();
      this.loadDropdownOptions();
    });
  }

  isPbFunded(funds): boolean {
    let isFunded = false
    Object.keys(funds).forEach(year => {
      if(Number(year) >= this.pomFy && Number(funds[year]) !== 0) {
        isFunded = true;
        return false;
      }
    });
    return isFunded;
  }

  initPinnedBottomRows(){
    let pinnedData = [];
    let pbTotal: IntMap = {};
    let pomTotal: IntMap = {};
    let deltaTotal: IntMap = {};
    this.data.forEach(row => {
      switch(row.phaseType) {
        case PhaseType.POM:
          Object.keys(row.fundingLine.funds).forEach(key => {
            pomTotal[key] = (pomTotal[key] || 0) + row.fundingLine.funds[key];
          });
          break;
        case PhaseType.PB:
          Object.keys(row.fundingLine.funds).forEach(key => {
            pbTotal[key] = (pbTotal[key] || 0) + row.fundingLine.funds[key];
          });
          break;
        case PhaseType.DELTA:
          Object.keys(row.fundingLine.funds).forEach(key => {
            deltaTotal[key] = (deltaTotal[key] || 0) + row.fundingLine.funds[key];
          });
          break;
      }
    });

    let pbRow: DataRow = new DataRow();

    pbRow.fundingLine = {appropriation: 'Total Funds Request', funds: pbTotal};
    pbRow.phaseType = PhaseType.PB;
    pinnedData.push(pbRow);

    let pomRow: DataRow = new DataRow();
    pomRow.fundingLine = {appropriation: 'Total Funds Request', funds: pomTotal};
    pomRow.phaseType = PhaseType.POM;
    pinnedData.push(pomRow);

    let deltaRow: DataRow = new DataRow();
    deltaRow.fundingLine = {appropriation: 'Total Funds Request', funds: deltaTotal};
    deltaRow.phaseType = PhaseType.DELTA;
    pinnedData.push(deltaRow);

    this.pinnedBottomData = pinnedData;
  }

  generateColumns(data) {
    this.columnDefs = [
      {
        headerName: 'Appropriation',
        field: 'fundingLine.appropriation',
        editable: true,
        onCellValueChanged: params => this.onFundingLineValueChanged(params),
        cellClassRules: {
          'font-weight-bold': params => {return this.colSpanCount(params) > 1},
          'row-span': params => {return this.rowSpanCount(params) > 1}
          },
        cellClass: 'funding-line-default',
        rowSpan: params => {return this.rowSpanCount(params)},
        colSpan: params => {return this.colSpanCount(params)},
        cellEditorSelector: params => {
          return {
            component: 'agSelectCellEditor',
            params: {values: this.appropriations}
          };
        }
      },
      {
        headerName: 'BA/BLIN',
        field: 'fundingLine.baOrBlin',
        editable: true,
        onCellValueChanged: params => this.onFundingLineValueChanged(params),
        cellEditorSelector: params => {
          return {
            component: 'agSelectCellEditor',
            params: {values: this.filteredBlins}
          };
        },
        cellClass: 'funding-line-default',
        cellClassRules: {
          'row-span': params => {return this.rowSpanCount(params) > 1}
        },
        rowSpan: params => {return this.rowSpanCount(params)}
       },
      {
        headerName: 'Item',
        field: 'fundingLine.item',
        editable: true,
        cellClass: 'funding-line-default',
        cellClassRules: {
          'row-span': params => {return this.rowSpanCount(params) > 1}
        },
        rowSpan: params => {return this.rowSpanCount(params)}
      },
      {
        headerName: 'OpAgency',
        field: 'fundingLine.opAgency',
        editable: true,
        cellClass: 'funding-line-default',
        cellClassRules: {
          'row-span': params => {return this.rowSpanCount(params) > 1}
        },
        rowSpan: params => {return this.rowSpanCount(params)}
      },
      {
        headerName: 'Cycle',
        field: 'phaseType',
        maxWidth: 92,
        suppressMenu: true,
        cellClassRules: {'font-weight-bold ag-medium-gray-cell': params => {return this.colSpanCount(params) > 1}},
        valueGetter: params => {
          switch(params.data.phaseType) {
            case PhaseType.POM:
              return params.data.phaseType + (this.pomFy - 2000);
            case PhaseType.PB:
              return params.data.phaseType + (this.pbFy - 2000);
            case PhaseType.DELTA:
              return params.data.phaseType;
          }
        }}];
    this.columnKeys = [
      this.pomFy - 3,
      this.pomFy -2,
      this.pomFy - 1,
      this.pomFy,
      this.pomFy + 1,
      this.pomFy + 2,
      this.pomFy + 3,
      this.pomFy + 4];

    this.columnKeys.forEach(key => {

      let subHeader;
      let cellClass = [];
      switch(Number(key)) {
        case (this.pomFy + 4):
          subHeader = 'BY+4';
          cellClass = ['text-right'];
          break;
        case this.pomFy + 3:
          subHeader = 'BY+3';
          cellClass = ['text-right'];
          break;
        case this.pomFy + 2:
          subHeader = 'BY+2';
          cellClass = ['text-right'];
          break;
        case this.pomFy + 1:
          subHeader = 'BY+1';
          cellClass = ['text-right'];
          break;
        case this.pomFy:
          subHeader = 'BY';
          cellClass = ['text-right'];
          break;
        case this.pomFy - 1:
          subHeader = 'CY';
          cellClass = ['ag-cell-white', 'text-right'];
          break;
        case this.pomFy - 2:
          subHeader = 'PY';
          cellClass = ['ag-cell-white', 'text-right'];
          break;
        case this.pomFy -3:
          subHeader = 'PY-1';
          cellClass = ['ag-cell-white', 'text-right'];
          break;
      }
      if (subHeader) {
        let colDef = {
          headerName: subHeader,
          type: "numericColumn",
          children: [{
            headerName: key,
            field: 'fundingLine.funds.' + key,
            maxWidth: 92,
            suppressMenu: true,
            cellClassRules: {
              'ag-cell-edit': params => {
                return this.isEditable(params, key)
              },
              'font-weight-bold': params => {
                return this.colSpanCount(params) > 1
              }
            },
            cellStyle: params => {
              if (!this.isValidBa(params.data.fundingLine.baOrBlin, key, params.data.fundingLine.funds[key])) {
                return {color: 'red', 'font-weigh': 'bold'};
              };
            },
            editable: params => {
              return this.isEditable(params, key)
            },
            onCellValueChanged: params => this.onBudgetYearValueChanged(params),
            valueFormatter: params => {
              return this.currencyFormatter(params)
            }
          }]
        };
        this.columnDefs.push(colDef);
      }
      });
    this.agGrid.api.setColumnDefs(this.columnDefs);
    this.agGrid.api.sizeColumnsToFit();

  }

  addRow(){
    let funds = {};;
    this.columnKeys.forEach(key => {
      funds[key] = 0;
    });
    let emptyFundingLine = {
      acquisitionType: null,
      appropriation: null,
      baOrBlin: null,
      emphases: [],
      funds: funds,
      id: null,
      item: null,
      opAgency: null,
      programElement: null,
      variants: []
    };

    let newPomRow: DataRow = new DataRow();
    newPomRow.phaseType = PhaseType.POM;
    newPomRow.fundingLine = JSON.parse(JSON.stringify(emptyFundingLine));

    this.data.push(newPomRow);
    this.pr.fundingLines.push(newPomRow.fundingLine);
    this.agGrid.api.setRowData(this.data);
    this.agGrid.api.setFocusedCell(this.data.length - 1, 'fundingLine.appropriation');
    this.agGrid.api.startEditingCell({rowIndex: this.data.length - 1, colKey: 'fundingLine.appropriation'});
  }

  isEditable(params, key): boolean{
    return key >= this.pomFy &&
      params.data.phaseType == PhaseType.POM &&
      params.data.fundingLine.appropriation !== 'Total Funds Request'
  }

  rowSpanCount(params): number {
    if (params.data.phaseType === PhaseType.PB) {
      return 3;
    } else {
      return 1;
    }
  }

  colSpanCount(params): number {
    if (params.data.fundingLine.appropriation === 'Total Funds Request') {
      return 4;
    } else {
      return 1;
    }
  }

  currencyFormatter(value) {
    if(isNaN(value.value)) {
      value.value = 0;
    }
    var usdFormate = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
    return usdFormate.format(value.value);
  }

  generateDelta(pomFundinLine, pbFundinLine): FundingLine{
    let deltaFundingLine = JSON.parse(JSON.stringify(pomFundinLine));
    Object.keys(pomFundinLine.funds).forEach(year => {
      let total = pomFundinLine.funds[year] - pbFundinLine.funds[year] as number;
      deltaFundingLine.funds[year]= total;
    })
    return deltaFundingLine;
  }

  private async setPomFiscalYear() {
    const pom: Pom = (await this.pomService.getById(this.pr.phaseId).toPromise()).result;
    this.pomFy = pom.fy;
  }

  private async loadDropdownOptions() {
    this.appropriations = await this.tagsService.tagAbbreviationsForAppropriation();
    if(this.data.filter(d => d.fundingLine.appropriation === 'PROC').length > 0) {
      this.appropriations.splice(this.appropriations.indexOf('PROC'), 1);
    }

    let blins = await this.tagsService.tagAbbreviationsForBlin();
    let bas = await this.tagsService.tagAbbreviationsForBa();
    this.baOrBlins = blins.concat(bas);
  }

  private async getPBData(): Promise<ProgrammaticRequest>{
    const user: User = await this.globalsService.user().toPromise();
    const pb: PB = (await this.pbService.getLatest(user.currentCommunityId).toPromise()).result;
    this.pbFy = pb.fy;

    if(!this.pr.originalMrId) {
      return;
    }

    const pbPr: ProgrammaticRequest = (await this.prService.getByPhaseAndMrId(pb.id, this.pr.originalMrId).toPromise()).result;

    if(!pbPr){
      return; // there is no PB PR is the PR is created from the "Program of Record" or like "New Program"
    }
    return pbPr;
  }

  onBudgetYearValueChanged(params){
    let year = params.colDef.headerName;
    let pomNode = params.data;
    pomNode.fundingLine.funds[year] = Number(params.newValue);

    let displayModel = this.agGrid.api.getModel();
    let pbNode = displayModel.getRow(params.node.rowIndex - 1);
    if (pbNode !== undefined && pbNode.data.phaseType === PhaseType.PB) {
      let deltaNode = displayModel.getRow(params.node.rowIndex + 1);

      deltaNode.data.fundingLine = this.generateDelta(pomNode.fundingLine, pbNode.data.fundingLine);
    }
    this.agGrid.api.refreshCells();
    this.initPinnedBottomRows();
    this.isValid = this.isValidBa(params.data.fundingLine.baOrBlin, year, params.newValue);
  }

  onFundingLineValueChanged(params) {
    if (params.colDef.headerName === 'Appropriation') {
      this.filterBlins(params.data.fundingLine.appropriation);
    }
    if(params.data.fundingLine.appropriation && params.data.fundingLine.baOrBlin){
      params.data.fundingLine.opAgency = this.pr.leadComponent
      switch(params.data.fundingLine.appropriation){
        case 'RDTE':
        case 'RDT&E':
          params.data.fundingLine.item = this.pr.functionalArea + params.data.fundingLine.baOrBlin.replace(/[^1-9]/g,'');;
          break;
        case 'PROC':
          //TODO: show a table to let the user map (?)
          break;
      }

      if (params.data.fundingLine.item) {
        this.autoValuesService.programElement(params.data.fundingLine.baOrBlin, params.data.fundingLine.item).then( pe => {
          params.data.fundingLine.programElement = pe;
        });
      }
    }
    this.agGrid.api.refreshCells();
  }

  isValidBa(ba: string, year: number, value: number): boolean {
    if(this.pr.type === ProgramType.GENERIC && this.pr.creationTimeType === CreationTimeType.SUBPROGRAM_OF_MRDB) {
      return this.isValidBaWithRespectToParent(ba, year) && this.isValidBaWithRespectToChildren(ba, year);
    } else {
      return true;
    }
  }

  isValidBaWithRespectToParent(ba: string, year: number): boolean {
    return PRUtils.isParentBaSumGreaterThanChildren(ba, year, this.parentPr, this.prs);
  }

  isValidBaWithRespectToChildren(ba: string, year: number): boolean {
    return PRUtils.isParentBaSumGreaterThanChildren(ba, year, this.pr, this.prs);
  }

  filterBlins(appropriation) {
    if ('PROC' === appropriation) {
      this.filteredBlins = this.baOrBlins.filter(baOrBlin => (baOrBlin.match(/00/)));
    } else {
      this.filteredBlins = this.baOrBlins.filter(baOrBlin => (baOrBlin.match(/BA[1-4]/)));
    }
  }
}
