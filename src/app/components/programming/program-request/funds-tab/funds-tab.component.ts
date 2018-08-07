import { ProgrammaticRequest } from './../../../../generated/model/programmaticRequest';
import { ProgramType } from './../../../../generated/model/programType';
import { PRUtils } from './../../../../services/pr.utils.service';
import { AutoValuesService } from './AutoValues.service';
import { FeedbackComponent } from './../../../feedback/feedback.component';
import { User } from './../../../../generated/model/user';
import { GlobalsService } from './../../../../services/globals.service';
import { PB } from './../../../../generated/model/pB';
import { Component, Input, OnChanges, ViewChild, OnInit, ViewEncapsulation } from '@angular/core'
import { FundingLine, POMService, Pom, PRService, PBService, CreationTimeType, IntMap } from '../../../../generated'
import { Row } from './Row';
import { Key } from './Key';
import { PhaseType } from "../../select-program-request/UiProgrammaticRequest";
import { DataRow } from "./DataRow";
import { AgGridNg2 } from "ag-grid-angular";

@Component({
  selector: 'funds-tab',
  templateUrl: './funds-tab.component.html',
  styleUrls: ['./funds-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FundsTabComponent implements OnChanges, OnInit {

  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;
  @ViewChild("agGrid") private agGrid: AgGridNg2;
  @Input() private pr: ProgrammaticRequest;
  private parentPr: ProgrammaticRequest;
  @Input() private prs: ProgrammaticRequest[];

  private pomFy: number;
  private pbFy: number;
  // key is appropriation+blin
  private rows: Map<string, Row> = new Map<string, Row>();

  // for the add FL section
  private appropriations: string[] = [];
  private appropriation: string;
  private baOrBlins: string[] = [];
  private baOrBlin: string;
  private item: string;
  private opAgencies: string[] = [];
  private opAgency: string;
  private programElement: string;
  private acquisitionTypes: string[];
  private acquisitionType: string;
  private columnKeys;
  public columnDefs = [];
  public data;
  public pinnedBottomData;
  public editType= '';

  constructor(private pomService: POMService,
              private pbService: PBService,
              private prService: PRService,
              private globalsService: GlobalsService,
              private autoValuesService: AutoValuesService ) {}

  ngOnInit() {
    this.loadDropdownOptions();
  }

  async ngOnChanges() {
    if(!this.pr.phaseId) {
      return;
    }
    this.initDataRows();
    this.initRows();
    if(this.pr.type === ProgramType.GENERIC && this.pr.creationTimeType === CreationTimeType.SUBPROGRAM_OF_PR_OR_UFR) {
      this.parentPr = (await this.prService.getById(this.pr.creationTimeReferenceId).toPromise()).result
    }
  }

  initDataRows(){
    let data: Array<DataRow> = [];
    this.getPBData().then(value => {
      let pbPr = value;
      this.pr.fundingLines.forEach(fundingLine => {
        let pbRow: DataRow = new DataRow();
        pbRow.fundingLine = pbPr.fundingLines.filter(fl =>
          fundingLine.appropriation === fl.appropriation &&
          fundingLine.opAgency === fl.opAgency &&
          fundingLine.baOrBlin === fl.baOrBlin &&
          fundingLine.item === fl.item
        )[0];
        pbRow.phaseType = PhaseType.PB;
        data.push(pbRow);

        let pomRow: DataRow = {fundingLine: fundingLine, phaseType: PhaseType.POM}
        data.push(pomRow);

        let deltaRow: DataRow = new DataRow();
        deltaRow.fundingLine= this.generateDelta(pomRow.fundingLine, pbRow.fundingLine);
        deltaRow.phaseType = PhaseType.DELTA;
        data.push(deltaRow);
      });
      this.generateColumns(this.pr.fundingLines);
      this.data = data;
      this.initPinnedBottomRows()
    });
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
        cellClass: ['row-span'],
        editable: true,
        cellClassRules: {'font-weight-bold': params => {return this.colSpanCount(params) > 1}},
        rowSpan: params => {return this.rowSpanCount(params)},
        colSpan: params => {return this.colSpanCount(params)},
        cellEditorSelector: params => {
          return {
            component: 'select',
            params: {values: this.appropriations}
          };
        }
      },
      {
        headerName: 'BA/BLIN',
        field: 'fundingLine.baOrBlin',
        editable: true,
        cellEditorSelector: params => {
          return {
            component: 'select',
            params: {values: this.baOrBlins}
          };
        },
        cellClass: ['row-span'],
        rowSpan: params => {return this.rowSpanCount(params)}
       },
      {
        headerName: 'Item',
        field: 'fundingLine.item',
        editable: true,
        cellClass: ['row-span'],
        rowSpan: params => {return this.rowSpanCount(params)}
      },
      {
        headerName: 'OpAgency',
        field: 'fundingLine.opAgency',
        editable: true,
        cellClass: ['row-span'],
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

    if (data && data.length > 0) {
      this.columnKeys = [];
      data.forEach(fl => {
        Object.keys(fl.funds).forEach(year => {
          this.columnKeys.push(year);
        })
      });
      this.columnKeys.sort();
      this.columnKeys = Array.from(new Set(this.columnKeys));
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
  }

  addRow(){
    let funds = {};;
    this.columnKeys.forEach(key => {
      funds[key] = 0;
    });
    let emptyFundingLine = {
      appropriation: '',
      baOrBlin: '',
      opAgency: '',
      item: '',
      programElement: '',
      acquisitionType: '',
      funds: funds,
      variants: []
    };

    let newPBRow: DataRow = new DataRow();
    newPBRow.phaseType = PhaseType.PB;
    newPBRow.fundingLine = JSON.parse(JSON.stringify(emptyFundingLine));

    let newPomRow: DataRow = new DataRow();
    newPomRow.phaseType = PhaseType.POM;
    newPomRow.fundingLine = JSON.parse(JSON.stringify(emptyFundingLine));

    let newDeltaRow: DataRow = new DataRow();
    newDeltaRow.phaseType = PhaseType.DELTA;
    newDeltaRow.fundingLine = JSON.parse(JSON.stringify(emptyFundingLine));

    this.data.push(newPBRow, newPomRow, newDeltaRow);
    this.pr.fundingLines.push(newPomRow.fundingLine);
    this.agGrid.api.setRowData(this.data);
    this.agGrid.api.setFocusedCell(this.data.length - 3, 'fundingLine.appropriation');
    this.agGrid.api.startEditingCell({rowIndex: this.data.length - 3, colKey: 'fundingLine.appropriation'});
    this.editType = 'fullRow';
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

  private initRows() {
    this.setPomFiscalYear();
    this.setPOMtoRows();
    this.setPBtoRows();
  }

  private async setPomFiscalYear() {
    const pom: Pom = (await this.pomService.getById(this.pr.phaseId).toPromise()).result;
    this.pomFy = pom.fy;
  }

  private async loadDropdownOptions() {
    {
      this.opAgencies = await this.globalsService.tagAbbreviationsForOpAgency();
      this.opAgency = this.opAgencies[0];
    }
    {
      this.appropriations = await this.globalsService.tagAbbreviationsForAppropriation();
      this.appropriation = this.appropriations[0];
      this.onAppropriationChange();
    }
    {
      this.baOrBlins = await this.globalsService.tagAbbreviationsForBlin();
      this.baOrBlin = this.getInitiallySelectedBlins()[0];
      this.onBaOrBlinChange();
    }
    {
      this.acquisitionTypes = await this.globalsService.tagAbbreviationsForAcquisitionType();
      this.acquisitionType = this.acquisitionTypes[0];
    }
  }

  onAppropriationChange() {
    this.updateBaOrBlins();
  }

  onBaOrBlinChange() {
    this.updateProgramElement();
    this.updateItem();
  }

  onItemChange() {
    this.updateProgramElement();
  }

  async updateBaOrBlins() {
    this.baOrBlins = await this.autoValuesService.baOrBlins(this.appropriation);
    this.onBaOrBlinChange()
  }

  async updateProgramElement() {
    this.programElement = await this.autoValuesService.programElement(this.baOrBlin, this.item);
  }

  updateItem() {
    this.item = this.autoValuesService.item(this.pr.functionalArea, this.baOrBlin);
  }

  private setPOMtoRows() {
    this.rows.clear();
    this.pr.fundingLines.forEach(fundingLine => {
      var key = Key.create(fundingLine.appropriation, fundingLine.baOrBlin, fundingLine.item, fundingLine.opAgency);
      this.rows.set(key, new Row( fundingLine.appropriation,
                                  fundingLine.baOrBlin,
                                  fundingLine.item,
                                  fundingLine.opAgency,
                                  new Map<number, number>(),
                                  fundingLine ) );
    });
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

    let deltaNode = displayModel.getRow(params.node.rowIndex + 1);

    deltaNode.data.fundingLine = this.generateDelta(pomNode.fundingLine, pbNode.data.fundingLine);
    this.agGrid.api.refreshCells();
    this.initPinnedBottomRows();
  }

  private async setPBtoRows() {
    const user: User = await this.globalsService.user().toPromise();
    const pb: PB = (await this.pbService.getLatest(user.currentCommunityId).toPromise()).result;
    this.pbFy = pb.fy;

    // there is no PB if there is no this.pr.originalMrId
    if(!this.pr.originalMrId) return;

    const pbPr: ProgrammaticRequest = (await this.prService.getByPhaseAndMrId(pb.id, this.pr.originalMrId).toPromise()).result;

    if(!pbPr) return; // there is no PB PR is the PR is created from the "Program of Record" or like "New Program"

    pbPr.fundingLines.forEach(pbFundingLine => {
      const key = Key.create(pbFundingLine.appropriation, pbFundingLine.baOrBlin, pbFundingLine.item, pbFundingLine.opAgency);
      if (this.rows.has(key)) {
        var row: Row = this.rows.get(key);
        Object.keys(pbFundingLine.funds).forEach( yearstr => {
          row.pbFunds.set(+yearstr, pbFundingLine.funds[yearstr]);
          row.calculateTotalForYear(+yearstr);
        });
      };
    });
  }

  addFundingLine() {
    const key: string = Key.create(this.appropriation, this.baOrBlin, this.item, this.opAgency);
    if (this.rows.has(key)) {
      this.feedback.failure('Funding Line already exists');
    } else {
      // now set this same data in the current data (for saves)
      var fundingLine: FundingLine = {
        appropriation: this.appropriation,
        baOrBlin: this.baOrBlin,
        item: this.item,
        opAgency: this.opAgency,
        programElement: this.programElement,
        acquisitionType: this.acquisitionType,
        funds: {},
        variants: []
      };
      this.pr.fundingLines.push(fundingLine);
      this.setPOMtoRows();
      this.setPBtoRows();
    }
  }

  onEdit(value: string, row: Row, year: number) {
    const oldValue = row.fundingLine.funds[year];
    row.fundingLine.funds[year] = +value;
    if(!this.isValidBa(row.fundingLine.baOrBlin, year, +value)) {
      row.fundingLine.funds[year] = oldValue;
      this.initRows();
      this.feedback.failure('value entered is invalid');
    }
    row.calculateTotalForYear(year);
  }

  isValidBa(ba: string, year: number, value: number): boolean {
    if(this.pr.type === ProgramType.GENERIC && this.pr.creationTimeType === CreationTimeType.SUBPROGRAM_OF_PR_OR_UFR)  {
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

  // wierd algorithm for initial BLINs selection based on the initial this.appropriation selection. Possibly flawn.
  getInitiallySelectedBlins(): string[] {
    if ('PROC' === this.appropriation) return this.baOrBlins.filter(baOrBlin => (baOrBlin.match(/00/)));
    else if ('RDTE' === this.appropriation) return this.baOrBlins.filter(baOrBlin => (baOrBlin.match(/BA[1-4]/)));
    else if ('O&M' === this.appropriation) return this.baOrBlins.filter(baOrBlin => (baOrBlin.match(/BA[5-7]/)));
    else return this.baOrBlins;
  }

  totals(year: number, mode: string) {
    var sum: number = 0;
    this.rows.forEach(row => {
           if ('PB'    === mode) sum += row.pbFunds.get(year)       || 0;
      else if ('POM'   === mode) sum += row.fundingLine.funds[year] || 0;
      else if ('TOTAL' === mode) sum += row.deltaFunds.get(year)    || 0;
    });
    return sum;
  }

}
