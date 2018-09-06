import { TagsService } from '../../../../services/tags.service';
import {Component, OnInit, Input, ViewChild} from '@angular/core'
import {
  FundingLine, UFR, POMService, Pom, PRService, PBService,
  IntMap
} from '../../../../generated'
import {PhaseType} from "../../../programming/select-program-request/UiProgrammaticRequest";
import {FormatterUtil} from "../../../../utils/formatterUtil";
import {AgGridNg2} from "ag-grid-angular";
import {DataRow} from "../../../programming/program-request/funds-tab/DataRow";
import {DeleteRenderer} from "../../../renderers/delete-renderer/delete-renderer.component";
import {AutoValuesService} from "../../../programming/program-request/funds-tab/AutoValues.service";

@Component({
  selector: 'ufr-funds-tab',
  templateUrl: './ufr-funds-tab.component.html',
  styleUrls: ['./ufr-funds-tab.component.scss']
})
export class UfrFundsComponent implements OnInit {
  @Input() ufr: UFR;
  @Input() editable: boolean = false;
  @ViewChild("agGridProcessedChanges") private agGridProcessedChanges: AgGridNg2;
  @ViewChild("agGridCurrentFunding") private agGridCurrentFunding: AgGridNg2;
  @ViewChild("agGridRevisedPrograms") private agGridRevisedPrograms: AgGridNg2;
  private pomFy: number;
  private appropriations: string[] = [];
  private baOrBlins: string[] = [];
  private filteredBlins: string[] = [];
  private columnKeys;
  newFLType;
  currentFundingColumnDefs = [];
  processedChangesColumnDefs = [];
  revisedProgramsColumnDefs = [];
  processedChange;
  revisedPrograms;
  currentFunding;
  existingFundingLines: FundingLine[] = [];
  selectedFundingLine: FundingLine = null;
  frameworkComponents = {deleteRenderer: DeleteRenderer};
  context = {parentComponent: this};
  isDisabledAddFundingLines;
  overlayNoRowsTemplate = '<div style="margin-top: -30px;">No Rows To Show</div>'

  constructor(private pomService: POMService,
              private pbService: PBService,
              private prService: PRService,
              private autoValuesService: AutoValuesService,
              private tagsService: TagsService) { }

  ngOnInit() {
    this.pomService.getById(this.ufr.phaseId).subscribe(pom => {
      this.pomFy =  pom.result.fy;
      this.columnKeys = [
        this.pomFy - 3,
        this.pomFy -2,
        this.pomFy - 1,
        this.pomFy,
        this.pomFy + 1,
        this.pomFy + 2,
        this.pomFy + 3,
        this.pomFy + 4];
      this.generateColumns();
      this.initDataRows();
      this.initCurrentFunding();
      this.processedChangesColumnDefs.unshift({
        headerName: '',
        valueGetter: () => {return 'Processed Change'},
        rowSpan: params => {return params.api.getDisplayedRowCount()}
      });
      this.agGridProcessedChanges.api.setColumnDefs(this.processedChangesColumnDefs);
      this.agGridProcessedChanges.api.sizeColumnsToFit();
    });
  }

  initCurrentFunding() {
    let data: Array<DataRow> = [];
    this.prService.getById(this.ufr.shortyId).subscribe(pr => {
      pr.result.fundingLines.forEach(fundingLine => {
        let pomRow: DataRow = {fundingLine: fundingLine, phaseType: PhaseType.POM}
        data.push(pomRow);
      });
      this.currentFunding = data;
      this.calculateRevisedChanges();
    });
    this.currentFundingColumnDefs = JSON.parse(JSON.stringify(this.processedChangesColumnDefs));
    this.currentFundingColumnDefs.unshift({
      headerName: '',
      valueGetter: () => {return 'Current Funding'},
      rowSpan: params => {return params.api.getDisplayedRowCount()}
    });
  }

  calculateRevisedChanges() {
    let data: Array<DataRow> = [];
    this.processedChange.forEach(pc => {
      let cf = this.currentFunding.filter(cf => {
        return cf.fundingLine.appropriation === pc.fundingLine.appropriated &&
          cf.fundingLine.blin === pc.fundingLine.blin &&
          cf.fundingLine.opAgency === pc.fundingLine.opAgency &&
          cf.fundingLine.item === pc.fundingLine.item
      });
      let row: DataRow = JSON.parse(JSON.stringify(pc));
      Object.keys(row.fundingLine.funds).forEach(year =>{
        row.fundingLine.funds[year] = (cf.fundingLine? cf.fundingLine.funds[year] : 0) + pc.fundingLine.funds[year];
      });
      data.push(row);
    });
    this.revisedPrograms = data;
    this.revisedProgramsColumnDefs = JSON.parse(JSON.stringify(this.processedChangesColumnDefs));
    this.revisedProgramsColumnDefs.unshift({
      headerName: '',
      valueGetter: () => {return 'Revised Program'},
      rowSpan: params => {return params.api.getDisplayedRowCount()}
    });

  }

  initDataRows(){
    let data: Array<DataRow> = [];
    this.ufr.fundingLines.forEach(fundingLine => {
      let pomRow: DataRow = {fundingLine: fundingLine, phaseType: PhaseType.POM}
      data.push(pomRow);
    });
    this.processedChange = data;
    this.loadDropdownOptions();
    // if (this.processedChange.some(row => row.fundingLine.userCreated === true)) {
    //   this.agGridProcessedChanges.columnApi.setColumnVisible('delete', true);
    //   this.agGridProcessedChanges.api.sizeColumnsToFit();
    // }
    this.agGridProcessedChanges.gridOptions.alignedGrids = [];
    this.agGridProcessedChanges.gridOptions.alignedGrids.push(this.agGridCurrentFunding.gridOptions);
    this.agGridProcessedChanges.gridOptions.alignedGrids.push(this.agGridRevisedPrograms.gridOptions);

    this.agGridCurrentFunding.gridOptions.alignedGrids = [];
    this.agGridCurrentFunding.gridOptions.alignedGrids.push(this.agGridProcessedChanges.gridOptions);
    this.agGridCurrentFunding.gridOptions.alignedGrids.push(this.agGridRevisedPrograms.gridOptions);
  }

  selectFundingLineType(flType: string){
    this.newFLType = flType;
  }

  next(){
    switch(this.newFLType){
      case 'Add a new Funding Line':
        this.addRow();
        break;
      case 'Add an existing Funding Line':
        this.ufr.fundingLines.push(this.selectedFundingLine);
        let pomRow: DataRow = {fundingLine: this.selectedFundingLine, phaseType: PhaseType.POM}
        this.processedChange.push(pomRow);
        this.agGridProcessedChanges.api.setRowData(this.processedChange);
        break;
    }
  }

  generateColumns() {
    this.processedChangesColumnDefs = [
      {
        headerName: 'funds values are expressed in ($K)',
        children: [{
          headerName: '',
          colId: 'delete',
          suppressToolPanel: true,
          hide: true,
          cellRenderer: 'deleteRenderer',
          cellClass: 'funding-line-default',
          cellStyle: {'text-align': 'center'},
          width: 50
        },
          {
            headerName: 'Appropriation',
            field: 'fundingLine.appropriation',
            suppressToolPanel: true,
            editable: params => {
              return this.isEditable(params)
            },
            onCellValueChanged: params => this.onFundingLineValueChanged(params),
            cellClass: 'funding-line-default',
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
            suppressToolPanel: true,
            editable: params => {
              return this.isEditable(params)
            },
            onCellValueChanged: params => this.onFundingLineValueChanged(params),
            cellEditorSelector: params => {
              if (params.data.fundingLine.appropriation) {
                this.filterBlins(params.data.fundingLine.appropriation);
              }
              return {
                component: 'agSelectCellEditor',
                params: {values: this.filteredBlins}
              };
            },
            cellClass: 'funding-line-default'
          },
          {
            headerName: 'Item',
            field: 'fundingLine.item',
            editable: params => {
              return this.isEditable(params)
            },
            cellClass: 'funding-line-default',
            onCellValueChanged: params => this.onFundingLineValueChanged(params)
          },
          {
            headerName: 'OpAgency',
            field: 'fundingLine.opAgency',
            hide: true,
            cellClass: 'funding-line-default'
          }]}
    ];

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
          suppressToolPanel: true,
          children: [{
            headerName: key,
            field: 'fundingLine.funds.' + key,
            maxWidth: 92,
            suppressMenu: true,
            suppressToolPanel: true,
            cellClassRules: {
              'ag-cell-edit': params => {
                return this.isAmountEditable(params, key)
              }
            },
            editable: params => {
              return this.isAmountEditable(params, key)
            },
            onCellValueChanged: params => this.onBudgetYearValueChanged(params),
            valueFormatter: params => {
              return FormatterUtil.currencyFormatter(params)
            }
          }]
        };
        this.processedChangesColumnDefs.push(colDef);
      }
    });

    let totalColDef = {
      headerName: 'CTC',
      suppressMenu: true,
      suppressToolPanel: true,
      maxWidth: 92,
      type: "numericColumn",
      valueGetter: params => {return this.getTotal(params.data, this.columnKeys)},
      valueFormatter: params => {return FormatterUtil.currencyFormatter(params)}
    };
    this.processedChangesColumnDefs.push(totalColDef);
  }

  getTotal(pr, columnKeys): number {
    let result = 0;
    columnKeys.forEach(year => {
      if(year >= this.pomFy) {
        let amount = pr.fundingLine.funds[year];
        result += isNaN(amount)? 0 : amount;
      }
    });
    return result;
  }

  generateEmptyFundingLine(pomFundingLine?: FundingLine): FundingLine{
    let funds = {};
    this.columnKeys.forEach(key => {
      funds[key] = 0;
    });
    let emptyFundingLine: FundingLine = {
      acquisitionType: null,
      appropriation: null,
      baOrBlin: null,
      funds: funds,
      id: null,
      item: null,
      opAgency: null,
      programElement: null,
      variants: []
    };
    if(pomFundingLine){
      emptyFundingLine.appropriation = pomFundingLine.appropriation
      emptyFundingLine.item = pomFundingLine.item
      emptyFundingLine.opAgency = pomFundingLine.opAgency
      emptyFundingLine.baOrBlin = pomFundingLine.baOrBlin
      emptyFundingLine.userCreated = pomFundingLine.userCreated;
    } else {
      emptyFundingLine.userCreated = true
    }
    return emptyFundingLine;
  }

  addRow(){
    let newPomRow: DataRow = new DataRow();
    newPomRow.phaseType = PhaseType.POM;
    newPomRow.fundingLine = JSON.parse(JSON.stringify(this.generateEmptyFundingLine()));

    this.ufr.fundingLines.push(newPomRow.fundingLine);
    this.processedChange.push(newPomRow);
    this.agGridProcessedChanges.columnApi.setColumnVisible('delete', true);
    this.agGridProcessedChanges.api.sizeColumnsToFit();
    this.agGridProcessedChanges.api.setRowData(this.processedChange);
    this.agGridProcessedChanges.api.setFocusedCell(this.processedChange.length - 3, 'fundingLine.appropriation');
    this.agGridProcessedChanges.api.startEditingCell({rowIndex: this.processedChange.length - 3, colKey: 'fundingLine.appropriation'});
  }

  isEditable(params): boolean{
    return params.data.fundingLine.userCreated === true
  }

  isAmountEditable(params, key): boolean{
    return key >= this.pomFy && params.data.fundingLine.appropriation !== 'Total Funds Request'
  }

  private async loadDropdownOptions() {
    this.appropriations = await this.tagsService.tagAbbreviationsForAppropriation();
    if(this.processedChange.filter(d => d.fundingLine.appropriation === 'PROC').length > 0) {
      this.appropriations.splice(this.appropriations.indexOf('PROC'), 1);
    }

    let blins = await this.tagsService.tagAbbreviationsForBlin();
    let bas = await this.tagsService.tagAbbreviationsForBa();
    this.baOrBlins = blins.concat(bas);
    this.isDisabledAddFundingLines = !this.canAddMoreFundingLines();
  }

  onBudgetYearValueChanged(params){
    let year = params.colDef.headerName;
    let pomNode = params.data;
    pomNode.fundingLine.funds[year] = Number(params.newValue);
    this.agGridProcessedChanges.api.refreshCells();
    this.loadDropdownOptions();
  }

  onGridReady(params) {
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 2500);
    window.addEventListener("resize", function() {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  onRowDataChanged(params){
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 2500);
  }

  onColumnValueChanged(params){
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 2500);
  }

  delete(index) {
    this.ufr.fundingLines.splice(this.ufr.fundingLines.indexOf(this.processedChange[index + 1].fundingLine), 1);
    this.processedChange.splice(index, 3);
    this.agGridProcessedChanges.api.setRowData(this.processedChange);

    this.loadDropdownOptions();

    if (!this.processedChange.some(row => row.fundingLine.userCreated === true)) {
      this.agGridProcessedChanges.columnApi.setColumnVisible('delete', false);
      this.agGridProcessedChanges.api.sizeColumnsToFit();
    }
  }

  onToolPanelVisibleChanged(params) {
    this.agGridProcessedChanges.api.sizeColumnsToFit();
  }

  onColumnVisible(params) {
    this.agGridProcessedChanges.api.sizeColumnsToFit();
  }

  onCellEditingStarted(params) {
    this.filterBlins(params.data.fundingLine.appropriation);
    this.agGridProcessedChanges.api.refreshCells();
  }

  onFundingLineValueChanged(params) {
    let pomNode = this.processedChange[params.node.rowIndex + 1];
    if (params.colDef.headerName === 'Appropriation') {
      this.filterBlins(params.data.fundingLine.appropriation);
    }
    if(params.data.fundingLine.appropriation && params.data.fundingLine.baOrBlin){
      this.tagsService.tags('OpAgency (OA)').subscribe(tags => {
        params.data.fundingLine.opAgency = tags.find(tag => tag.name.indexOf(this.ufr.leadComponent) !== -1).abbr
        this.agGridProcessedChanges.api.refreshCells();
      });

      if (params.data.fundingLine.appropriation === 'RDTE'){
        params.data.fundingLine.item = this.ufr.functionalArea + params.data.fundingLine.baOrBlin.replace(/[^1-9]/g,'');;
      }

      if (params.data.fundingLine.item) {
        this.autoValuesService.programElement(params.data.fundingLine.baOrBlin, params.data.fundingLine.item).then( pe => {
          params.data.fundingLine.programElement = pe;
        });
      }
      pomNode.fundingLine.appropriation = params.data.fundingLine.appropriation;
      pomNode.fundingLine.baOrBlin = params.data.fundingLine.baOrBlin;
      pomNode.fundingLine.opAgency = params.data.fundingLine.opAgency;
      pomNode.fundingLine.item = params.data.fundingLine.item;
      pomNode.fundingLine.programElement = params.data.fundingLine.programElement;
    }
    this.agGridProcessedChanges.api.refreshCells();
  }

  filterBlins(appropriation) {
    if ('PROC' === appropriation) {
      this.filteredBlins = this.baOrBlins.filter(baOrBlin => (baOrBlin.match(/00/)));
    } else {
      this.filteredBlins = this.baOrBlins.filter(baOrBlin => (baOrBlin.match(/BA[1-9]/)));
    }
    this.removeExistingBlins();
    this.limitBaForOrganizations()
    this.isDisabledAddFundingLines = !this.canAddMoreFundingLines();
  }

  removeExistingBlins() {
    this.filteredBlins = this.filteredBlins.filter(blin => {
      let fl = this.ufr.fundingLines.find(fl => fl.baOrBlin === blin);
      let efl = this.existingFundingLines.find(fl => fl.baOrBlin === blin);
      return  fl === undefined && efl === undefined && (blin.match(/00/) || blin.match(/BA[1-9]/));
    });
  }

  limitBaForOrganizations() {
    switch(this.ufr.leadComponent) {
      case 'DUSA TE':
      case 'JRO':
      case 'OSD':
      case 'PAIO':
        this.filteredBlins = this.filteredBlins.filter(blin => {
          return blin === 'BA6';
        });
        this.appropriations = this.appropriations.filter(a => a === 'RDTE');
        break;
      case 'JSTO':
        this.filteredBlins = this.filteredBlins.filter(blin => {
          return blin.match(/BA[1-3]/);
        });
        this.appropriations = this.appropriations.filter(a => a === 'RDTE');
        break;
      case 'JPEO':
        this.filteredBlins = this.filteredBlins.filter(blin => {
          return blin.match(/BA[4-5]/) || blin === 'BA7' || blin.match(/00/);
        });
        break;
    }
  }

  canAddMoreFundingLines(): boolean {
    return this.baOrBlins.filter(blin => {
      let fl = this.ufr.fundingLines.find(fl => fl.baOrBlin === blin);
      return  fl === undefined && ( (blin.match(/00/) && !this.ufr.fundingLines.some(fl => fl.appropriation === 'PROC')) || blin.match(/BA[1-9]/)) ;
    }).length > 0;
  }


}

interface tabledata {
  appropriation: string,
  baOrBlin: string,
  opagency: string,
  item: string,
  modelfunds?: Map<number, number>,
  ufrfunds?: Map<number, number>,
  totalfunds?: Map<number, number>
}
