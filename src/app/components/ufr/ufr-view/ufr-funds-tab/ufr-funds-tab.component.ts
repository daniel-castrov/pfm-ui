import { TagsService } from '../../../../services/tags.service';
import {Component, OnInit, Input, ViewChild, ViewEncapsulation} from '@angular/core'
import {
  FundingLine, UFR, POMService, PRService, PBService, ProgrammaticRequest,
  ShortyType, ProgramsService
} from '../../../../generated'
import {FormatterUtil} from "../../../../utils/formatterUtil";
import {AgGridNg2} from "ag-grid-angular";
import {DeleteRenderer} from "../../../renderers/delete-renderer/delete-renderer.component";
import {AutoValuesService} from "../../../programming/program-request/funds-tab/AutoValues.service";
import {DataRow} from "./DataRow";

@Component({
  selector: 'ufr-funds-tab',
  templateUrl: './ufr-funds-tab.component.html',
  styleUrls: ['./ufr-funds-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UfrFundsComponent implements OnInit {
  @Input() ufr: UFR;
  @Input() editable: boolean = false;
  @ViewChild("agGridProposedChanges") private agGridProposedChanges: AgGridNg2;
  @ViewChild("agGridCurrentFunding") private agGridCurrentFunding: AgGridNg2;
  @ViewChild("agGridRevisedPrograms") private agGridRevisedPrograms: AgGridNg2;

  private pomFy: number;
  private appropriations: string[] = [];
  private baOrBlins: string[] = [];
  private filteredBlins: string[] = [];
  private columnKeys;
  private prParent: ProgrammaticRequest;

  defaultColumnDefs = [];
  currentFundingColumnDefs = [];
  proposedChangesColumnDefs = [];
  revisedProgramsColumnDefs = [];
  proposedChange;
  revisedPrograms;
  currentFunding;
  existingFundingLines: FundingLine[] = [];
  selectedFundingLine: FundingLine = null;
  frameworkComponents = {deleteRenderer: DeleteRenderer};
  context = {parentComponent: this};
  isDisabledAddFundingLines;
  overlayNoRowsTemplate = '<div style="margin-top: 30px;">No Rows To Show</div>'

  constructor(private pomService: POMService,
              private pbService: PBService,
              private prService: PRService,
              private programService: ProgramsService,
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
    });
  }

  initCurrentFunding() {
    let data: Array<DataRow> = [];
    if (this.ufr.fundingLines && this.ufr.fundingLines.length > 0 && this.ufr.shortyId) {
      if (this.ufr.shortyType === ShortyType.MRDB_PROGRAM ||
        this.ufr.shortyType === ShortyType.NEW_FOS_FOR_MRDB_PROGRAM ||
        this.ufr.shortyType === ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM) {
        this.programService.getProgramById(this.ufr.shortyId).subscribe(pr => {
          this.prParent = pr.result;
          pr.result.fundingLines.forEach(fundingLine => {
            let pomRow: DataRow = {fundingLine: fundingLine, editable: false}
            data.push(pomRow);
          });
          this.currentFunding = data;
          this.initRevisedChanges();
        });
      } else {
        this.prService.getById(this.ufr.shortyId).subscribe(pr => {
          this.prParent = pr.result;
          pr.result.fundingLines.forEach(fundingLine => {
            let pomRow: DataRow = {fundingLine: fundingLine, editable: false}
            data.push(pomRow);
          });
          this.currentFunding = data;
          this.initRevisedChanges();
        });
      }

    } else {
      let pomRow: DataRow = {fundingLine: JSON.parse(JSON.stringify(this.generateEmptyFundingLine())), editable: false};
      data.push(pomRow);
      this.currentFunding = data;
      this.initRevisedChanges();
    }
    let tempColumnDefs =Object.assign({}, this.defaultColumnDefs);
    this.currentFundingColumnDefs = Object.keys(tempColumnDefs).map(i => tempColumnDefs[i]);
    this.currentFundingColumnDefs.unshift({
      colId: 'flType',
      //maxWidth: 122,
      valueGetter: () => {return 'Current Funding'},
      rowSpan: params => {return this.rowSpanCount(params)},
      cellClassRules: {
        'row-span': params => {return this.rowSpanCount(params) > 1}
      },
      cellClass: 'funding-line-default'
    });

    // remove the cellrenderer form this table
    this.proposedChangesColumnDefs[1].children[0].cellRenderer='';

    this.agGridCurrentFunding.api.setColumnDefs(this.currentFundingColumnDefs);

  }

  rowSpanCount(params){
    if(params.node.rowIndex === 0){
      return params.api.getDisplayedRowCount();
    } else {
      return 1;
    }
  }

  initRevisedChanges() {
    this.calculateRevisedChanges();
    let tempColumnDefs =Object.assign({}, this.defaultColumnDefs);
    this.revisedProgramsColumnDefs = Object.keys(tempColumnDefs).map(i => tempColumnDefs[i]);
    this.revisedProgramsColumnDefs.unshift({
      colId: 'flType',
      //maxWidth: 122,
      valueGetter: () => {return 'Revised Program'},
      rowSpan: params => {return this.rowSpanCount(params)},
      cellClassRules: {
        'row-span': params => {return this.rowSpanCount(params) > 1}
      },
      cellClass: 'funding-line-default'
    });

     // remove the cellrenderer form this table
    this.proposedChangesColumnDefs[1].children[0].cellRenderer='';

    this.agGridRevisedPrograms.api.setColumnDefs(this.revisedProgramsColumnDefs);
    this.showDeleteColumns();

  }

  showDeleteColumns(){
    // if (this.proposedChange.some(row => row.fundingLine.userCreated === true)) {
    //   console.log("YES");
    //   this.agGridCurrentFunding.columnApi.setColumnVisible('delete', true);
    //   this.agGridProposedChanges.columnApi.setColumnVisible('delete', true);
    //   this.agGridRevisedPrograms.columnApi.setColumnVisible('delete', true);

    // } else {
    //   console.log("NO");
    //   this.agGridCurrentFunding.columnApi.setColumnVisible('delete', false);
    //   this.agGridProposedChanges.columnApi.setColumnVisible('delete', false);
    //   this.agGridRevisedPrograms.columnApi.setColumnVisible('delete', false);
    // }

    setTimeout(() => {
      this.agGridCurrentFunding.api.sizeColumnsToFit();
      this.agGridProposedChanges.api.sizeColumnsToFit();
      this.agGridRevisedPrograms.api.sizeColumnsToFit();
    },500);

  }

  calculateRevisedChanges() {
    let data: Array<DataRow> = [];
    if (this.ufr.fundingLines && this.ufr.fundingLines.length > 0) {
      this.proposedChange.forEach(pc => {
        let cf = this.currentFunding.find(cf => {
          return cf.fundingLine.appropriation === pc.fundingLine.appropriation &&
            cf.fundingLine.baOrBlin === pc.fundingLine.baOrBlin &&
            cf.fundingLine.opAgency === pc.fundingLine.opAgency &&
            cf.fundingLine.item === pc.fundingLine.item
        });
        let row: DataRow = JSON.parse(JSON.stringify(pc));
        row.editable = false;
        row.fundingLine.userCreated = false;
        Object.keys(row.fundingLine.funds).forEach(year =>{
          row.fundingLine.funds[year] = (cf? cf.fundingLine.funds[year] : 0) + pc.fundingLine.funds[year];
        });
        data.push(row);
      });
      this.revisedPrograms = data;
    } else {
      let pomRow: DataRow = {fundingLine: JSON.parse(JSON.stringify(this.generateEmptyFundingLine())), editable: false};
      data.push(pomRow);
      this.revisedPrograms = data;
    }
  }

  initDataRows(){
    let data: Array<DataRow> = [];
    this.ufr.fundingLines.forEach(fundingLine => {
      let pomRow: DataRow = {fundingLine: fundingLine, editable: true}
      data.push(pomRow);
    });
    this.proposedChange = data;
    this.loadDropdownOptions();
    this.agGridProposedChanges.gridOptions.alignedGrids = [];
    this.agGridProposedChanges.gridOptions.alignedGrids.push(this.agGridCurrentFunding.gridOptions);
    this.agGridProposedChanges.gridOptions.alignedGrids.push(this.agGridRevisedPrograms.gridOptions);

    this.agGridCurrentFunding.gridOptions.alignedGrids = [];
    this.agGridCurrentFunding.gridOptions.alignedGrids.push(this.agGridProposedChanges.gridOptions);
    this.agGridCurrentFunding.gridOptions.alignedGrids.push(this.agGridRevisedPrograms.gridOptions);

    this.agGridRevisedPrograms.gridOptions.alignedGrids = [];
    this.agGridRevisedPrograms.gridOptions.alignedGrids.push(this.agGridProposedChanges.gridOptions);
    this.agGridRevisedPrograms.gridOptions.alignedGrids.push(this.agGridCurrentFunding.gridOptions);
    let tempColumnDefs =Object.assign({}, this.defaultColumnDefs);
    this.proposedChangesColumnDefs = Object.keys(tempColumnDefs).map(i => tempColumnDefs[i]);
    this.proposedChangesColumnDefs.unshift({
      colId: 'flType',
      //maxWidth: 122,
      valueGetter: params => {return 'Proposed Change'},
      rowSpan: params => {return this.rowSpanCount(params)},
      cellClassRules: {
        'row-span': params => {return this.rowSpanCount(params) > 1}
        },
      cellClass: 'funding-line-default'
    });
    this.agGridProposedChanges.api.setColumnDefs(this.proposedChangesColumnDefs);
    this.agGridProposedChanges.api.sizeColumnsToFit();
    this.initCurrentFunding();
  }

  // addFundLine(flType: string){
  //   switch(newFLType){
  //     case 'Add a new Funding Line':
  //       this.addRow();
  //       break;
  //     case 'Add an existing Funding Line':
  //       this.ufr.fundingLines.push(this.selectedFundingLine);
  //       let pomRow: DataRow = {fundingLine: this.selectedFundingLine, editable: true}
  //       this.proposedChange.push(pomRow);
  //       this.agGridProposedChanges.api.setRowData(this.proposedChange);
  //       break;
  //   }
  // }

  addFundLine(){
    this.addRow();
  }

  generateColumns() {
    this.defaultColumnDefs = [
      {
        headerName: 'funds values are expressed in ($K)',
        children: [{
          colId: 'delete',
          maxWidth: 40,
          suppressToolPanel: true,
          hide: false,
          cellRenderer: 'deleteRenderer',
          cellClass: 'funding-line-default',
          cellStyle: {'text-align': 'center'},
        },
          {
            headerName: 'Appropriation',
            field: 'fundingLine.appropriation',
            maxWidth: 92,
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
            maxWidth: 92,
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
            maxWidth: 92,
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
        this.defaultColumnDefs.push(colDef);
      }
    });

    let totalColDef = {
      headerName: 'BY Total',
      suppressMenu: true,
      suppressToolPanel: true,
      maxWidth: 92,
      type: "numericColumn",
      valueGetter: params => {return this.getTotal(params.data, this.columnKeys)},
      valueFormatter: params => {return FormatterUtil.currencyFormatter(params)}
    };
    this.defaultColumnDefs.push(totalColDef);
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
    newPomRow.fundingLine = JSON.parse(JSON.stringify(this.generateEmptyFundingLine()));
    newPomRow.editable = true;
    this.ufr.fundingLines.push(newPomRow.fundingLine);
    this.proposedChange.push(newPomRow);

    this.agGridProposedChanges.api.setRowData(this.proposedChange);
    this.agGridProposedChanges.api.setFocusedCell(this.proposedChange.length - 1, 'fundingLine.appropriation');
    this.agGridProposedChanges.api.startEditingCell({rowIndex: this.proposedChange.length - 1, colKey: 'fundingLine.appropriation'});

    this.showDeleteColumns();

  }

  isEditable(params): boolean{
    return params.data.fundingLine.userCreated === true
  }

  isAmountEditable(params, key): boolean{
    return key >= this.pomFy && params.data.editable
  }

  private async loadDropdownOptions() {
    this.appropriations = await this.tagsService.tagAbbreviationsForAppropriation();
    if(this.proposedChange.filter(d => d.fundingLine.appropriation === 'PROC').length > 0) {
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
    this.agGridProposedChanges.api.refreshCells();
    this.loadDropdownOptions();
    this.calculateRevisedChanges();
  }

  onGridReady(params) {
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 500);
    window.addEventListener("resize", function() {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  onColumnValueChanged(params){
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 500);
  }

  delete(index, data) {
    this.ufr.fundingLines.splice(this.ufr.fundingLines.indexOf(this.proposedChange[index].fundingLine), 1);
    this.proposedChange.splice(index, 1);
    this.agGridProposedChanges.api.setRowData(this.proposedChange);

    this.loadDropdownOptions();

    this.showDeleteColumns();
  }

  onToolPanelVisibleChanged(params) {
    this.agGridProposedChanges.api.sizeColumnsToFit();
  }

  onColumnVisible(params) {
    this.agGridProposedChanges.api.sizeColumnsToFit();
  }

  onCellEditingStarted(params) {
    this.filterBlins(params.data.fundingLine.appropriation);
    this.agGridProposedChanges.api.refreshCells();
  }

  onFundingLineValueChanged(params) {
    let pomNode = params.node.data;
    if (params.colDef.headerName === 'Appropriation') {
      this.filterBlins(params.data.fundingLine.appropriation);
    }
    if(params.data.fundingLine.appropriation && params.data.fundingLine.baOrBlin){
      this.tagsService.tags('OpAgency (OA)').subscribe(tags => {
        params.data.fundingLine.opAgency = tags.find(tag => tag.name.indexOf(this.prParent.leadComponent) !== -1).abbr
        this.agGridProposedChanges.api.refreshCells();
      });

      if (params.data.fundingLine.appropriation === 'RDTE'){
        params.data.fundingLine.item = this.prParent.functionalArea + params.data.fundingLine.baOrBlin.replace(/[^1-9]/g,'');;
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
    this.agGridProposedChanges.api.refreshCells();
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
    switch(this.prParent.leadComponent) {
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
