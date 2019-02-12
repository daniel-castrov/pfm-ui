import {TagsService, TagType} from '../../../../services/tags.service';
import {Component, Input, OnChanges, ViewChild, ViewEncapsulation} from '@angular/core'
import {FundingLine, PBService, Pom, POMService, ProgramsService, PRService, RolesPermissionsService, ShortyType, UFR} from '../../../../generated'
import {FormatterUtil} from "../../../../utils/formatterUtil";
import {AgGridNg2} from "ag-grid-angular";
import {DeleteRenderer} from "../../../renderers/delete-renderer/delete-renderer.component";
import {AutoValuesService} from "../../../programming/program-request/funds-tab/AutoValues.service";
import {DataRow} from "./DataRow";
import {PRUtils} from '../../../../services/pr.utils.service';
import {FundingLinesUtils} from "../../../../utils/FundingLinesUtils";
import {Validation} from "../../../programming/program-request/funds-tab/Validation";
import {Notify} from "../../../../utils/Notify";
import {PhaseType} from "../../../programming/select-program-request/UiProgramRequest";
import {GridType} from "../../../programming/program-request/funds-tab/GridType";

@Component({
  selector: 'ufr-funds-tab',
  templateUrl: './ufr-funds-tab.component.html',
  styleUrls: ['./ufr-funds-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UfrFundsComponent implements OnChanges {
  @Input() ufr: UFR;
  @Input() fy: number
  @Input() editable: boolean = false;
  @Input() readonly: boolean;
  @ViewChild("agGridProposedChanges") private agGridProposedChanges: AgGridNg2;
  @ViewChild("agGridCurrentFunding") private agGridCurrentFunding: AgGridNg2;
  @ViewChild("agGridRevisedPrograms") private agGridRevisedPrograms: AgGridNg2;

  private pom: Pom;
  private appropriations: string[] = [];
  private functionalAreas: string[] = [];
  private baOrBlins: string[] = [];
  private filteredBlins: string[] = [];
  private columnKeys;
  private shorty: any;
  private ismgr: boolean = false;

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
  components = { numericCellEditor: this.getNumericCellEditor() };

  constructor(private pomService: POMService,
              private pbService: PBService,
              private prService: PRService,
              private programService: ProgramsService,
              private autoValuesService: AutoValuesService,
              private tagsService: TagsService,
              private rolesvc: RolesPermissionsService) {}

  ngOnChanges() {
    this.pomService.getById(this.ufr.containerId).subscribe(pom => {
      this.pom =  pom.result;
      this.columnKeys = [
        this.pom.fy - 3,
        this.pom.fy -2,
        this.pom.fy - 1,
        this.pom.fy,
        this.pom.fy + 1,
        this.pom.fy + 2,
        this.pom.fy + 3,
        this.pom.fy + 4];
      this.generateColumns();
      this.initDataRows();
      this.agGridCurrentFunding.api.sizeColumnsToFit();
      this.agGridProposedChanges.api.sizeColumnsToFit();
      this.agGridRevisedPrograms.api.sizeColumnsToFit();
    });
    this.ismgr = false;
    this.rolesvc.getRoles().subscribe(data => {
      this.ismgr = (data.result.includes('POM_Manager'));
    });
  }


  initCurrentFunding() {
    let data: Array<DataRow> = [];
    if (this.ufr.shortyType === ShortyType.MRDB_PROGRAM) {
      this.programService.getProgramById(this.ufr.shortyId).subscribe(pr => {
        this.shorty = pr.result;
        pr.result.fundingLines.forEach(fundingLine => {
          let pomRow: DataRow = {fundingLine: fundingLine,
            editable: false,
            gridType: GridType.CURRENT_PR}
          data.push(pomRow);
        });
        this.currentFunding = data;
        this.initRevisedChanges();
      });
    } else if (this.ufr.shortyType === ShortyType.PR) {
      this.prService.getById(this.ufr.shortyId).subscribe(pr => {
        this.shorty = pr.result;
        pr.result.fundingLines.forEach(fundingLine => {
          let pomRow: DataRow = {fundingLine: fundingLine,
            editable: false,
            gridType: GridType.CURRENT_PR}
          data.push(pomRow);
        });
        this.currentFunding = data;
        this.initRevisedChanges();
      });
    } else {
      this.shorty = this.ufr;
      let pomRow: DataRow = {fundingLine: JSON.parse(JSON.stringify(this.generateEmptyFundingLine())),
        editable: false,
        gridType: GridType.CURRENT_PR
      };
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
        row.gridType = GridType.CURRENT_PR;
        Object.keys(row.fundingLine.funds).forEach(year =>{
          row.fundingLine.funds[year] = (cf && cf.fundingLine.funds[year]? cf.fundingLine.funds[year] : 0) + (pc.fundingLine.funds[year]? pc.fundingLine.funds[year] : 0);
        });
        data.push(row);
      });
      this.revisedPrograms = data;
    } else {
      let pomRow: DataRow = {fundingLine: JSON.parse(JSON.stringify(this.generateEmptyFundingLine())),
        editable: false,
        gridType: GridType.CURRENT_PR};
      data.push(pomRow);
      this.revisedPrograms = data;
    }
  }

  initDataRows(){
    let data: Array<DataRow> = [];
    this.ufr.fundingLines.forEach(fundingLine => {
      let pomRow: DataRow = {fundingLine: fundingLine,
        editable: true,
        gridType: GridType.CURRENT_PR}
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
      valueGetter: () => {return 'Proposed Change'},
      rowSpan: params => {return this.rowSpanCount(params)},
      cellClassRules: {
        'row-span': params => {return this.rowSpanCount(params) > 1}
        },
      cellClass: 'funding-line-default'
    });
    this.agGridProposedChanges.api.setColumnDefs(this.proposedChangesColumnDefs);
    this.initCurrentFunding();
  }

  generateColumns() {
    this.defaultColumnDefs = [
      {
        headerName: 'Funds in $K',
        children: [{
          colId: 'delete',
          maxWidth: 40,
          cellRenderer: 'deleteRenderer',
          suppressToolPanel: true,
          cellClass: 'funding-line-default'
        },
          {
            headerName: 'Appn',
            headerTooltip: 'Appropriation',
            field: 'fundingLine.appropriation',
            suppressToolPanel: true,
            maxWidth: 64,
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
            headerTooltip: 'BA/BLIN',
            field: 'fundingLine.baOrBlin',
            maxWidth: 70,
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
            headerTooltip: 'Item',
            field: 'fundingLine.item',
            maxWidth: 70,
            editable: params => {
              return this.isEditable(params) && params.data.fundingLine.baOrBlin
            },
            cellClass: 'funding-line-default',
            cellEditorSelector: params => {
              let component = 'agSelectCellEditor';
              if(params.data.fundingLine.appropriation === 'PROC'){
                component = 'agTextCellEditor';
              }
              return {
                component: component,
                params: {values: this.functionalAreas}
              };
            },
            onCellValueChanged: params => this.onFundingLineValueChanged(params)
          },
          {
            headerName: 'OpAgency',
            headerTooltip: 'OpAgency',
            field: 'fundingLine.opAgency',
            cellClass: 'funding-line-default',
            hide: true
          }]}
    ];

    this.columnKeys.forEach(key => {
      this.addYearlyColumns(key);
    });

    let totalColDef = {
      headerName: 'FYDP Total',
      headerTooltip: 'Future Years Defense Program Total',
      suppressMenu: true,
      suppressToolPanel: true,
      maxWidth: 90,
      cellClass:['text-right'],
      cellEditor: 'numericCellEditor',
      valueGetter: params => {return this.getTotal(params.data, this.columnKeys)},
      valueFormatter: params => {return FormatterUtil.currencyFormatter(params)}
    };
    this.defaultColumnDefs.push(totalColDef);

    let ctcColDef = {
      headerName: 'CTC',
      headerTooltip: 'Cost to Complete',
      suppressMenu: true,
      suppressToolPanel: true,
      maxWidth: 90,
      field: 'fundingLine.ctc',
      cellClass:['text-right'],
      cellClassRules: {
        'ag-cell-edit': params => {
          return this.isAmountEditable(params, this.pom.fy)
        },
        'text-right': params => {
          return this.isAmountEditable(params, this.pom.fy)
        },
        'delta-row': params => {
          return params.data.phaseType === PhaseType.DELTA;
        }
      },
      editable: params => {
        return this.isAmountEditable(params, this.pom.fy)
      },
      valueFormatter: params => {return FormatterUtil.currencyFormatter(params)}
    };
    this.defaultColumnDefs.push(ctcColDef);
  }

  private addYearlyColumns(key) {
    let subHeader;
    let cellClass = [];
    switch (Number(key)) {
      case (this.pom.fy + 4):
        subHeader = 'BY+4';
        cellClass = ['text-right'];
        break;
      case this.pom.fy + 3:
        subHeader = 'BY+3';
        cellClass = ['text-right'];
        break;
      case this.pom.fy + 2:
        subHeader = 'BY+2';
        cellClass = ['text-right'];
        break;
      case this.pom.fy + 1:
        subHeader = 'BY+1';
        cellClass = ['text-right'];
        break;
      case this.pom.fy:
        subHeader = 'BY';
        cellClass = ['text-right'];
        break;
      case this.pom.fy - 1:
        subHeader = 'CY';
        cellClass = ['ag-cell-white', 'text-right'];
        break;
      case this.pom.fy - 2:
        subHeader = 'PY';
        cellClass = ['ag-cell-white', 'text-right'];
        break;
      case this.pom.fy - 3:
        subHeader = 'PY-1';
        cellClass = ['ag-cell-white', 'text-right'];
        break;
    }
    if (subHeader) {
      let columnKey = key.toString().replace('20', 'FY')
      let colDef = {
        headerName: subHeader,
        suppressToolPanel: true,
        children: [{
          headerName: columnKey,
          colId: key,
          headerTooltip: 'Fiscal Year ' + key,
          field: 'fundingLine.funds.' + key,
          maxWidth: 90,
          suppressMenu: true,
          suppressToolPanel: true,
          type: "numericColumn",
          cellEditor: 'numericCellEditor',
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
  }

  getTotal(pr, columnKeys): number {
    let result = 0;
    columnKeys.forEach(year => {
      if(year >= this.pom.fy) {
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
    if (!this.shorty.leadComponent && !this.shorty.functionalArea) {
      Notify.error('You must select the lead component and the functional area in the program tab before creating a funding line')
    } else {
      let newPomRow: DataRow = new DataRow();
      newPomRow.fundingLine = JSON.parse(JSON.stringify(this.generateEmptyFundingLine()));
      newPomRow.editable = true;
      newPomRow.gridType = GridType.CURRENT_PR
      this.ufr.fundingLines.push(newPomRow.fundingLine);
      this.proposedChange.push(newPomRow);

      this.agGridProposedChanges.api.setRowData(this.proposedChange);
      this.agGridProposedChanges.api.setFocusedCell(this.proposedChange.length - 1, 'fundingLine.appropriation');
      this.agGridProposedChanges.api.startEditingCell({rowIndex: this.proposedChange.length - 1, colKey: 'fundingLine.appropriation'});
    }
  }

  isEditable(params): boolean{
    return params.data.fundingLine.userCreated === true
  }

  isAmountEditable(params, key): boolean{
    return key >= this.pom.fy && params.data.editable && !this.readonly;
  }

  private async loadDropdownOptions() {
    this.appropriations = await this.tagsService.tagAbbreviationsForAppropriation();
    this.functionalAreas = await this.tagsService.tagAbbreviationsForFunctionalArea()
    let blins = await this.tagsService.tagAbbreviationsForBlin();
    let bas = await this.tagsService.tagAbbreviationsForBa();
    this.baOrBlins = blins.concat(bas);
    this.isDisabledAddFundingLines = !this.canAddMoreFundingLines();
  }

  onBudgetYearValueChanged(params){
    let year = params.colDef.colId;
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

  delete(index, data) {
    this.ufr.fundingLines.splice(this.ufr.fundingLines.indexOf(this.proposedChange[index].fundingLine), 1);
    this.proposedChange.splice(index, 1);
    this.agGridProposedChanges.api.setRowData(this.proposedChange);

    this.loadDropdownOptions();
    this.calculateRevisedChanges();
  }


  sizeColumnsToFit(params) {
    if (params === null) {
      this.agGridProposedChanges.api.sizeColumnsToFit();
      this.agGridCurrentFunding.api.sizeColumnsToFit();
      this.agGridRevisedPrograms.api.sizeColumnsToFit();
    } else {
      params.api.sizeColumnsToFit();
    }
  }

  onCellEditingStarted(params) {
    this.filterBlins(params.data.fundingLine.appropriation);
    this.agGridProposedChanges.api.refreshCells();
  }

  onFundingLineValueChanged(params) {
    let pomNode = params.node.data;
    if (params.colDef.headerName === 'Appn') {
      this.filterBlins(params.data.fundingLine.appropriation);
      params.data.fundingLine.item = null;
      params.data.fundingLine.baOrBlin = null;
    }
    if (params.data.fundingLine.appropriation === 'RDTE' && params.colDef.headerName === 'Item' && params.newValue !== '') {
      params.data.fundingLine.item = params.newValue + params.data.fundingLine.baOrBlin.replace(/[^1-9]/g,'');
    } else {
      if(params.data.fundingLine.appropriation && params.data.fundingLine.baOrBlin){

        params.data.fundingLine.opAgency = PRUtils.getDefaultOpAgencyForLeadComponent(this.shorty.leadComponent);
        this.agGridProposedChanges.api.refreshCells();

        if (params.data.fundingLine.appropriation === 'RDTE'){
          params.data.fundingLine.item = this.shorty.functionalArea + params.data.fundingLine.baOrBlin.replace(/[^1-9]/g,'');
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
    }

    this.agGridProposedChanges.api.refreshCells();
    this.calculateRevisedChanges();
  }

  filterBlins(appropriation) {
    if ('PROC' === appropriation) {
      this.filteredBlins = this.baOrBlins.filter(baOrBlin => (baOrBlin.match(/00/)));
    } else {
      this.filteredBlins = this.baOrBlins.filter(baOrBlin => (baOrBlin.match(/BA[1-9]/)));
    }
    this.limitBaForLeadComponent()
    this.filteredBlins.unshift('');
    this.isDisabledAddFundingLines = !this.canAddMoreFundingLines();
  }

  limitBaForLeadComponent() {
    switch(this.shorty.leadComponent) {
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
          return blin.match(/BA[1-4]/);
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

  invalid(): boolean {
    return FundingLinesUtils.totalForAndAfterYear(this.ufr.fundingLines, this.fy) == 0;
  }

  get validate(): Validation {
    if(this.flHaveIncorrectBa()){
      return new Validation(false, 'You have a duplicate in the BA/Blin column. Changes were not saved');
    } else if (this.flHaveIncorrectAppropriation()){
      return new Validation(false, 'You can only have one funding line with the PROC appropriation. Changes were not saved');
    } else if (this.flIsIncomplete()) {
      return new Validation(false, 'You must fill all the fields for a funding line. Changes were not saved');
    } else {
      return new Validation(true);
    }
  }

  flHaveIncorrectAppropriation() : Boolean {
    let count = 0;
    this.ufr.fundingLines.forEach(function(fl) {
      if(fl.appropriation === 'PROC'){
        count++;
      }
    });
    return count > 1;
  }

  flIsIncomplete(): Boolean{
    let count = 0;
    this.ufr.fundingLines.forEach(function(fl, index) {
      if(fl.appropriation === null || fl.baOrBlin === null || fl.item === null){
        count++;
      }
    });
    return count > 0;
  }

  flHaveIncorrectBa(): Boolean{
    let duplicatesExist = false;
    let result = [];
    this.ufr.fundingLines.forEach(function(fl, index) {
      if (!result[fl.baOrBlin]) {
        result[fl.baOrBlin] = index;
      } else {
        duplicatesExist = true;
      }
    });
    return duplicatesExist;
  }

  getNumericCellEditor() {
    function isCharNumeric(charStr) {
      return !!/\d/.test(charStr);
    }
    function isKeyPressedNumeric(event) {
      var charCode = getCharCodeFromEvent(event);
      var charStr = String.fromCharCode(charCode);
      return isCharNumeric(charStr);
    }
    function getCharCodeFromEvent(event) {
      event = event || window.event;
      return typeof event.which === "undefined" ? event.keyCode : event.which;
    }
    function NumericCellEditor() {}
    NumericCellEditor.prototype.init = function(params) {
      this.focusAfterAttached = params.cellStartedEdit;
      this.eInput = document.createElement("input");
      this.eInput.style.width = "100%";
      this.eInput.style.height = "100%";
      this.eInput.value = isCharNumeric(params.charPress) ? params.charPress : params.value;
      var that = this;
      this.eInput.addEventListener("keypress", function(event) {
        if (!isKeyPressedNumeric(event)) {
          that.eInput.focus();
          if (event.preventDefault) event.preventDefault();
        }
      });
    };
    NumericCellEditor.prototype.getGui = function() {
      return this.eInput;
    };
    NumericCellEditor.prototype.afterGuiAttached = function() {
      if (this.focusAfterAttached) {
        this.eInput.focus();
        this.eInput.select();
      }
    };
    NumericCellEditor.prototype.isCancelBeforeStart = function() {
      return this.cancelBeforeStart;
    };
    NumericCellEditor.prototype.isCancelAfterEnd = function() {};
    NumericCellEditor.prototype.getValue = function() {
      return this.eInput.value;
    };
    NumericCellEditor.prototype.focusIn = function() {
      var eInput = this.getGui();
      eInput.focus();
      eInput.select();
      console.log("NumericCellEditor.focusIn()");
    };
    NumericCellEditor.prototype.focusOut = function() {
      console.log("NumericCellEditor.focusOut()");
    };
    return NumericCellEditor;
  }

}
