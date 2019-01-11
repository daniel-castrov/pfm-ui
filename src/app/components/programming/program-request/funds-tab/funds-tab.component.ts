import {TagsService, TagType} from '../../../../services/tags.service';
import {Program} from '../../../../generated/model/program';
import {ProgramType} from '../../../../generated/model/programType';
import {PRUtils} from '../../../../services/pr.utils.service';
import {AutoValuesService} from './AutoValues.service';
import {User} from '../../../../generated/model/user';
import {UserUtils} from '../../../../services/user.utils';
import {PB} from '../../../../generated/model/pB';
import {Component, Input, OnChanges, ViewChild, ViewEncapsulation} from '@angular/core'
import {
  CreationTimeType,
  FundingLine,
  IntMap,
  PBService,
  ProgramsService,
  PRService,
  Pom,
  ProgramStatus,
  RolesPermissionsService
} from '../../../../generated'
import {AgGridNg2} from "ag-grid-angular";
import {DataRow} from "./DataRow";
import {PhaseType} from "../../select-program-request/UiProgramRequest";
import {FormatterUtil} from "../../../../utils/formatterUtil";
import {DeleteRenderer} from "../../../renderers/delete-renderer/delete-renderer.component";
import {Validation} from "./Validation";
import {Notify} from "../../../../utils/Notify";
import {ViewSiblingsRenderer} from "../../../renderers/view-siblings-renderer/view-siblings-renderer.component";
import {GridType} from "./GridType";
import {CellEditor} from "../../../../utils/CellEditor";
import { ok } from 'assert';

@Component({
  selector: 'funds-tab',
  templateUrl: './funds-tab.component.html',
  styleUrls: ['./funds-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FundsTabComponent implements OnChanges {

  @ViewChild("agGrid") private agGrid: AgGridNg2;
  @ViewChild("agGridParent") private agGridParent: AgGridNg2;
  @ViewChild("agGridSiblings") private agGridSiblings: AgGridNg2;
  @Input() pr: Program;
  private parentPr: Program;
  private isFundsTabValid: any[] = [];
  @Input() private prs: Program[];

  @Input() private pom: Pom;
  private pomFy: number;
  private pbFy: number;
  private pbPr: Program;
  private ismgr: boolean = false;
  private fieldedits: boolean = false;

  private appropriations: string[] = [];
  private functionalAreas: string[] = [];
  private baOrBlins: string[] = [];
  private filteredBlins: string[] = [];
  private columnKeys;
  CreationTimeType = CreationTimeType;
  ProgramType = ProgramType;
  columnDefs = [];
  defaultColumnDefs = { editable: false };
  data;
  parentData;
  siblingsData;
  showSiblingsInformation: Boolean = false;
  showParentInformation: Boolean = false;
  pinnedBottomData;
  pinnedSiblingsBottomData;
  existingFundingLines: FundingLine[] = [];
  selectedFundingLine: FundingLine = null;
  frameworkComponents = { deleteRenderer: DeleteRenderer, viewSiblingsRenderer: ViewSiblingsRenderer };
  context = { parentComponent: this };
  overlayNoRowsTemplate = '<div style="margin-top: -30px;">No Rows To Show</div>';
  components = { numericCellEditor: CellEditor.getNumericCellEditor() };

  constructor(private pbService: PBService,
    private prService: PRService,
    private globalsService: UserUtils,
    private tagsService: TagsService,
    private autoValuesService: AutoValuesService,
    private programsService: ProgramsService,
    private rolesvc: RolesPermissionsService ) { }

  async ngOnChanges() {
    if (!this.pr.phaseId) {
      return;
    }
    if (this.agGrid && this.agGrid.api.getDisplayedRowCount() === 0) {
      if (this.pr.type === ProgramType.GENERIC && this.pr.creationTimeType === CreationTimeType.SUBPROGRAM_OF_PR) {
        this.parentPr = (await this.prService.getById(this.pr.creationTimeReferenceId).toPromise()).result;
      }

      if( this.pom ){
        this.pomFy = this.pom.fy;
        this.columnKeys = [
          this.pomFy - 3,
          this.pomFy - 2,
          this.pomFy - 1,
          this.pomFy,
          this.pomFy + 1,
          this.pomFy + 2,
          this.pomFy + 3,
          this.pomFy + 4];
        this.loadExistingFundingLines();
        this.initDataRows();
      }
    }

    this.ismgr = false;
    this.rolesvc.getRoles().subscribe(data => {
      this.ismgr = (data.result.includes('POM_Manager'));
    });
  }

  loadExistingFundingLines() {
    if (this.pr.creationTimeReferenceId && this.pr.creationTimeType === CreationTimeType.SUBPROGRAM_OF_PR) {
      this.prService.getById(this.pr.creationTimeReferenceId).subscribe(pr => {
        pr.result.fundingLines.forEach(fundingLine => {
          let isDuplicate = this.pr.fundingLines.some(fl => fl.appropriation === fundingLine.appropriation &&
            fl.baOrBlin === fundingLine.baOrBlin &&
            fl.item === fundingLine.item &&
            fl.opAgency === fundingLine.opAgency);
          if (!isDuplicate) {
            fundingLine.userCreated = true;
            this.existingFundingLines.push(fundingLine);
          }
        });
        this.existingFundingLines = FormatterUtil.removeDuplicates(this.existingFundingLines)
      });
    }
    if (this.pr.originalMrId) {
      this.programsService.getProgramById(this.pr.originalMrId).subscribe(program => {
        program.result.fundingLines.forEach(fundingLine => {
          let isDuplicate = this.pr.fundingLines.some(fl => fl.appropriation === fundingLine.appropriation &&
            fl.baOrBlin === fundingLine.baOrBlin &&
            fl.item === fundingLine.item &&
            fl.opAgency === fundingLine.opAgency);
          if (!isDuplicate) {
            fundingLine.userCreated = true;
            this.existingFundingLines.push(fundingLine);
          }
        });
        this.existingFundingLines = FormatterUtil.removeDuplicates(this.existingFundingLines)
      });
    }
  }

  initParentDataRows(selectedFundingLine: FundingLine) {
    let data: Array<DataRow> = [];
    this.parentPr.fundingLines.forEach(fundingLine => {
      if (selectedFundingLine.appropriation === fundingLine.appropriation &&
        selectedFundingLine.opAgency === fundingLine.opAgency &&
        selectedFundingLine.baOrBlin === fundingLine.baOrBlin &&
        selectedFundingLine.item === fundingLine.item) {
        let pomRow: DataRow = {
          programId: this.parentPr.shortName,
          gridType: GridType.PARENT,
          fundingLine: fundingLine,
          phaseType: PhaseType.POM
        };
        data.push(pomRow);
      }

    });
    this.parentData = data;
  }

  initSiblingsDataRows(selectedFundingLine: FundingLine) {
    let data: Array<DataRow> = [];
    this.prService.getSubProgramsById(this.pr.creationTimeReferenceId).subscribe(response => {
      response.result.forEach(subprogram => {
        if (this.pr.id !== subprogram.id) {
          subprogram.fundingLines.forEach(fundingLine => {
            if (selectedFundingLine.appropriation === fundingLine.appropriation &&
              selectedFundingLine.opAgency === fundingLine.opAgency &&
              selectedFundingLine.baOrBlin === fundingLine.baOrBlin &&
              selectedFundingLine.item === fundingLine.item) {
              let pomRow: DataRow = {
                programId: subprogram.shortName,
                gridType: GridType.SIBLINGS,
                fundingLine: fundingLine,
                phaseType: PhaseType.POM
              }
              data.push(pomRow);
            }
          });
        }
      });
      this.siblingsData = data;
      this.initSiblingsPinnedBottomRows();

      setTimeout(() => {
        if (this.data.some(row => row.fundingLine.userCreated === true)) {
          this.agGridParent.columnApi.setColumnVisible('delete', true);
          this.agGridSiblings.columnApi.setColumnVisible('delete', true);
        }
        if (this.agGridSiblings) {
          this.agGridSiblings.api.sizeColumnsToFit();
        }
        this.agGridParent.api.sizeColumnsToFit();
        this.agGrid.api.sizeColumnsToFit();
      }, 700);
    });
  }

  initSiblingsPinnedBottomRows() {
    let pinnedData = [];
    let subtotal: IntMap = {};
    this.siblingsData.forEach(row => {
      Object.keys(row.fundingLine.funds).forEach(key => {
        subtotal[key] = (subtotal[key] || 0) + row.fundingLine.funds[key];
      });
    });

    let subtotalRow: DataRow = new DataRow();
    subtotalRow.fundingLine = { funds: subtotal };
    subtotalRow.gridType = GridType.SIBLINGS;
    subtotalRow.phaseType = PhaseType.POM;
    subtotalRow.programId = 'Subtotal';
    pinnedData.push(subtotalRow);

    let remaining: IntMap = {};

    Object.keys(subtotalRow.fundingLine.funds).forEach(key => {
      remaining[key] = this.parentData[0].fundingLine.funds[key] - (subtotalRow.fundingLine.funds[key] || 0);
    });

    let remainingRow: DataRow = new DataRow();
    remainingRow.fundingLine = { funds: remaining };
    remainingRow.gridType = GridType.SIBLINGS;
    remainingRow.phaseType = PhaseType.POM;
    remainingRow.programId = 'Remaining';
    pinnedData.push(remainingRow);

    this.pinnedSiblingsBottomData = pinnedData;
  }

  initDataRows() {
    let data: Array<DataRow> = [];
    this.getPBData().then(value => {
      this.pbPr = value;
      this.pr.fundingLines.forEach(fundingLine => {
        let pomRow: DataRow = {
          programId: this.pr.shortName,
          gridType: GridType.CURRENT_PR,
          fundingLine: fundingLine,
          phaseType: PhaseType.POM
        }
        let pbRow: DataRow = new DataRow();
        pbRow.phaseType = PhaseType.PB;
        pbRow.gridType = GridType.CURRENT_PR;
        pbRow.programId = this.pr.shortName;
        if (this.pbPr !== undefined) {
          pbRow.fundingLine = this.pbPr.fundingLines.filter(fl =>
            fundingLine.appropriation === fl.appropriation &&
            fundingLine.opAgency === fl.opAgency &&
            fundingLine.baOrBlin === fl.baOrBlin &&
            fundingLine.item === fl.item
          )[0];
          pbRow.fundingLine.userCreated = fundingLine.userCreated;
        }

        if (pbRow.fundingLine === undefined) {
          pbRow.fundingLine = JSON.parse(JSON.stringify(this.generateEmptyFundingLine(pomRow.fundingLine)));
          pbRow.fundingLine.userCreated = fundingLine.userCreated;
        }

        let deltaRow: DataRow = new DataRow();
        deltaRow.fundingLine = this.generateDelta(pomRow.fundingLine, pbRow.fundingLine);
        deltaRow.phaseType = PhaseType.DELTA;
        data.push(pbRow);
        data.push(pomRow);
        data.push(deltaRow);
      });
      this.generateColumns();
      this.data = data;
      this.loadDropdownOptions();
      this.initPinnedBottomRows();
      if (this.data.some(row => row.fundingLine.userCreated === true)) {
        this.agGrid.columnApi.setColumnVisible('delete', true);
      }
      this.agGrid.api.sizeColumnsToFit();
    });
  }

  addParentFundingLine() {
    this.removeValues(this.selectedFundingLine);
    this.pr.fundingLines.push(this.selectedFundingLine);
    let pomRow: DataRow = {
      programId: this.pr.shortName,
      gridType: GridType.CURRENT_PR,
      fundingLine: this.selectedFundingLine,
      phaseType: PhaseType.POM
    };
    pomRow.fundingLine.userCreated = true;
    let pbRow: DataRow = new DataRow();
    pbRow.phaseType = PhaseType.PB;
    pbRow.programId = this.pr.shortName;
    pbRow.gridType = GridType.CURRENT_PR;

    if (this.pbPr !== undefined) {
      pbRow.fundingLine = this.pbPr.fundingLines.filter(fl =>
        this.selectedFundingLine.appropriation === fl.appropriation &&
        this.selectedFundingLine.opAgency === fl.opAgency &&
        this.selectedFundingLine.baOrBlin === fl.baOrBlin &&
        this.selectedFundingLine.item === fl.item
      )[0];
    }

    if (pbRow.fundingLine === undefined) {
      pbRow.fundingLine = JSON.parse(JSON.stringify(this.generateEmptyFundingLine(pomRow.fundingLine)));

    }

    let deltaRow: DataRow = new DataRow();
    deltaRow.fundingLine = this.generateDelta(pomRow.fundingLine, pbRow.fundingLine);
    deltaRow.phaseType = PhaseType.DELTA;
    this.data.push(pbRow);
    this.data.push(pomRow);
    this.data.push(deltaRow);
    this.agGrid.columnApi.setColumnVisible('delete', true);
    this.agGrid.api.sizeColumnsToFit();
    if (this.agGridSiblings && this.agGridParent) {
      this.agGridParent.columnApi.setColumnVisible('delete', true);
      this.agGridSiblings.columnApi.setColumnVisible('delete', true);
      this.agGridParent.api.sizeColumnsToFit();
      this.agGridSiblings.api.sizeColumnsToFit();
    }
    this.agGrid.api.setRowData(this.data);
    this.existingFundingLines.splice(this.existingFundingLines.indexOf(this.selectedFundingLine), 1);
    this.selectedFundingLine = null;

    this.columnKeys.forEach(year => {
      // FIXME: RPB: pretty sure this creates an array with at least 2018 indices. (we only ever use 4 of them)
      this.isFundsTabValid[year] = {
        isValid: this.isValidBa(pomRow.fundingLine.baOrBlin, year),
        baOrBlin: pomRow.fundingLine.baOrBlin,
        year: year
      };
    });
  }

  removeValues(fundingLine) {
    Object.keys(fundingLine.funds).forEach(year => {
      fundingLine.funds[year] = 0;
    });
  }

  initPinnedBottomRows() {
    let pinnedData = [];
    let pbTotal: IntMap = {};
    let pomTotal: IntMap = {};
    let deltaTotal: IntMap = {};
    this.data.forEach(row => {
      switch (row.phaseType) {
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

    pbRow.fundingLine = { funds: pbTotal };
    pbRow.programId = 'Total Funds Request';
    pbRow.fundingLine.appropriation = 'Total Funds Request';
    pbRow.phaseType = PhaseType.PB;
    pinnedData.push(pbRow);

    let pomRow: DataRow = new DataRow();
    pomRow.fundingLine = { funds: pomTotal };
    pomRow.programId = 'Total Funds Request';
    pomRow.fundingLine.appropriation = 'Total Funds Request';
    pomRow.phaseType = PhaseType.POM;
    pinnedData.push(pomRow);

    let deltaRow: DataRow = new DataRow();
    deltaRow.fundingLine = { funds: deltaTotal };
    deltaRow.programId = 'Total Funds Request';
    deltaRow.fundingLine.appropriation = 'Total Funds Request';

    deltaRow.phaseType = PhaseType.DELTA;
    pinnedData.push(deltaRow);

    this.pinnedBottomData = pinnedData;
  }

  generateColumns() {
    this.columnDefs = [
      {
        headerName: 'Funds in $K',
        children: [{
          headerName: '',
          colId: 'delete',
          suppressToolPanel: true,
          hide: true,
          cellRenderer: 'deleteRenderer',
          rowSpan: params => { return this.rowSpanCount(params) },
          cellClassRules: {
            'font-weight-bold': params => { return this.colSpanCount(params) > 1 },
            'row-span': params => { return this.rowSpanCount(params) > 1 }
          },
          cellClass: 'funding-line-default',
          cellStyle: { 'text-align': 'center', 'padding': '0px' },
          maxWidth: 40,
          minWidth: 40,
        },
        {
          headerName: 'Program ID',
          headerTooltip: 'Program ID',
          colId: 'programId',
          field: 'programId',
          hide: true,
          suppressToolPanel: true,
          cellClassRules: {
            'font-weight-bold': params => { return this.colSpanCount(params) > 1 },
            'row-span': params => { return this.rowSpanCount(params) > 1 }
          },
          cellClass: 'funding-line-default',
          rowSpan: params => { return this.rowSpanCount(params) },
          colSpan: params => { return this.colSpanCount(params) }
        },
        {
          headerName: 'Appn',
          headerTooltip: 'Appropriation',
          field: 'fundingLine.appropriation',
          suppressToolPanel: true,
          editable: params => {
            return this.isEditable(params)
          },
          onCellValueChanged: params => this.onFundingLineValueChanged(params),
          cellClassRules: {
            'font-weight-bold': params => { return this.colSpanCount(params) > 1 },
            'row-span': params => { return this.rowSpanCount(params) > 1 }
          },
          cellClass: 'funding-line-default',
          rowSpan: params => { return this.rowSpanCount(params) },
          colSpan: params => { return this.colSpanCount(params) },
          cellEditorSelector: params => {
            return {
              component: 'agSelectCellEditor',
              params: { values: this.appropriations }
            };
          }
        },
        {
          headerName: 'BA/BLIN',
          headerTooltip: 'BA/BLIN',
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
              params: { values: this.filteredBlins }
            };
          },
          cellClass: 'funding-line-default',
          cellClassRules: {
            'row-span': params => { return this.rowSpanCount(params) > 1 }
          },
          rowSpan: params => { return this.rowSpanCount(params) }
        },
        {
          headerName: 'Item',
          headerTooltip: 'Item',
          field: 'fundingLine.item',
          editable: params => {
            return this.isEditable(params) && params.data.fundingLine.baOrBlin
          },
          cellClass: 'funding-line-default',
          cellEditorSelector: params => {
            let component = 'agSelectCellEditor';
            if (params.data.fundingLine.appropriation === 'PROC') {
              component = 'agTextCellEditor';
            }
            return {
              component: component,
              params: { values: this.functionalAreas }
            };
          },
          onCellValueChanged: params => this.onFundingLineValueChanged(params),
          cellClassRules: {
            'row-span': params => { return this.rowSpanCount(params) > 1 }
          },
          rowSpan: params => { return this.rowSpanCount(params) }
        },
        {
          headerName: 'OpAgency',
          headerTooltip: 'OpAgency',
          field: 'fundingLine.opAgency',
          hide: true,
          maxWidth: 65,
          minWidth: 65,
          cellClass: 'funding-line-default',
          cellClassRules: {
            'row-span': params => { return this.rowSpanCount(params) > 1 }
          },
          rowSpan: params => { return this.rowSpanCount(params) }
        },
        {
          headerName: 'Cycle',
          headerTooltip: 'Cycle',
          field: 'phaseType',
          maxWidth: 80,
          minWidth: 80,
          suppressMenu: true,
          suppressToolPanel: true,
          cellClassRules: {
            'font-weight-bold ag-medium-gray-cell': params => {
              return this.colSpanCount(params) > 1
            },
            'delta-row': params => {
              return params.data.phaseType === PhaseType.DELTA;
            }
          },
          cellRenderer: 'viewSiblingsRenderer'
        }]
      }
    ];

    this.columnKeys.forEach(key => {
      this.addYearlyColumn(key);
    });

    let totalColDef = {
      headerName: 'FYDP Total',
      headerTooltip: 'Future Years Defense Program Total',
      suppressMenu: true,
      suppressToolPanel: true,
      maxWidth: 80,
      minWidth: 80,
      cellClass: 'text-right',
      valueGetter: params => { return this.getTotal(params.data, this.columnKeys) },
      valueFormatter: params => { return FormatterUtil.currencyFormatter(params) }
    };
    this.columnDefs.push(totalColDef);

    let ctcColDef = {
      headerName: 'CTC',
      headerTooltip: 'Cost to Complete',
      suppressMenu: true,
      suppressToolPanel: true,
      maxWidth: 80,
      minWidth: 80,
      field: 'fundingLine.ctc',
      cellEditor: 'numericCellEditor',
      cellClass: 'text-right',
      cellClassRules: {
        'ag-cell-edit': params => {
          return this.isAmountEditable(params, this.pomFy)
        },
        'font-weight-bold': params => {
          return this.colSpanCount(params) > 1
        },
        'delta-row': params => {
          return params.data.phaseType === PhaseType.DELTA;
        }
      },
      editable: params => {
        return this.isAmountEditable(params, this.pomFy)
      },
      valueFormatter: params => { return FormatterUtil.currencyFormatter(params) }
    };
    this.columnDefs.push(ctcColDef);

    this.agGrid.api.setColumnDefs(this.columnDefs);
    if (this.pr.type === ProgramType.GENERIC) {
      this.agGrid.columnApi.setColumnVisible('programId', true);
    }

    this.agGrid.api.sizeColumnsToFit();
  }

  getTotal(pr, columnKeys): number {
    let result = 0;
    columnKeys.forEach(year => {
      if (year >= this.pomFy) {
        let amount = pr.fundingLine.funds[year];
        result += isNaN(amount) ? 0 : amount;
      }
    });
    return result;
  }

  private addYearlyColumn(key) {
    let subHeader;
    let cellClass = [];
    switch (Number(key)) {
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
      case this.pomFy - 3:
        subHeader = 'PY-1';
        cellClass = ['ag-cell-white', 'text-right'];
        break;
    }
    if (subHeader) {
      let columnKey = key.toString().replace('20', 'FY')
      let colDef = {
        headerName: subHeader,
        type: "numericColumn",
        suppressToolPanel: true,
        children: [{
          headerName: columnKey,
          colId: key,
          headerTooltip: 'Fiscal Year ' + key,
          field: 'fundingLine.funds.' + key,
          maxWidth: 80,
          minWidth: 80,
          suppressMenu: true,
          suppressToolPanel: true,
          cellEditor: 'numericCellEditor',
          cellClass: 'text-right',
          cellClassRules: {
            'ag-cell-edit': params => {
              return this.isAmountEditable(params, key)
            },
            'font-weight-bold': params => {
              return this.colSpanCount(params) > 1
            },
            'delta-row': params => {
              return params.data.phaseType === PhaseType.DELTA;
            }
          },
          cellStyle: params => {
            if (this.prs &&
              params.data.phaseType === PhaseType.POM &&
              params.data.gridType === GridType.CURRENT_PR &&
              !this.isValidBa(params.data.fundingLine.baOrBlin, key)) {
              return {color: 'red', 'font-weight': 'bold'};
            }
            ;
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
      this.columnDefs.push(colDef);
    }
  }

  generateEmptyFundingLine(pomFundingLine?: FundingLine): FundingLine {
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
    if (pomFundingLine) {
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

  addRow() {
    let newPbRow: DataRow = new DataRow();

    newPbRow.programId = this.pr.shortName;
    newPbRow.phaseType = PhaseType.PB;
    newPbRow.gridType = GridType.CURRENT_PR;
    newPbRow.fundingLine = JSON.parse(JSON.stringify(this.generateEmptyFundingLine()));

    let newPomRow: DataRow = new DataRow();
    newPomRow.programId = this.pr.shortName;
    newPomRow.phaseType = PhaseType.POM;
    newPomRow.gridType = GridType.CURRENT_PR;
    newPomRow.fundingLine = JSON.parse(JSON.stringify(this.generateEmptyFundingLine()));

    let newDeltaRow: DataRow = new DataRow();
    newDeltaRow.fundingLine = this.generateDelta(newPomRow.fundingLine, newPbRow.fundingLine);
    newDeltaRow.phaseType = PhaseType.DELTA;
    newDeltaRow.gridType = GridType.CURRENT_PR;
    newDeltaRow.programId = this.pr.shortName;


    this.pr.fundingLines.push(newPomRow.fundingLine);
    this.data.push(newPbRow);
    this.data.push(newPomRow);
    this.data.push(newDeltaRow);
    this.agGrid.columnApi.setColumnVisible('delete', true);
    this.agGrid.api.sizeColumnsToFit();

    if (this.agGridParent && this.agGridSiblings) {
      this.agGridParent.columnApi.setColumnVisible('delete', true);
      this.agGridSiblings.columnApi.setColumnVisible('delete', true);
      this.agGridParent.api.sizeColumnsToFit();
      this.agGridSiblings.api.sizeColumnsToFit();
    }

    this.agGrid.api.setRowData(this.data);
    this.agGrid.api.setFocusedCell(this.data.length - 3, 'fundingLine.appropriation');
    this.agGrid.api.startEditingCell({ rowIndex: this.data.length - 3, colKey: 'fundingLine.appropriation' });
  }

  isEditable(params): boolean {
    return params.data.programId !== 'Total Funds Request' &&
      params.data.fundingLine.userCreated === true &&
      params.data.phaseType === PhaseType.PB &&
      params.data.gridType === GridType.CURRENT_PR &&
      ( this.ismgr || this.isEditableInReconciliation() );
  }

  isAmountEditable(params, key): boolean {
    return key >= this.pomFy &&
      params.data.phaseType == PhaseType.POM &&
      params.data.programId !== 'Total Funds Request' &&
      params.data.gridType === GridType.CURRENT_PR &&
      (this.ismgr || this.isEditableInReconciliation());
  }

  isEditableInReconciliation() {
    if (this.pom && Pom.StatusEnum.RECONCILIATION !== this.pom.status) {
      return true;
    }
    else {
      return (this.pr && this.pr.type === ProgramType.GENERIC &&
        ProgramStatus.SUBMITTED !== this.pr.programStatus);
    }
  }

  addFundingLineOk(): boolean {
    return this.ismgr || this.isEditableInReconciliation();
  }



  rowSpanCount(params): number {
    if (params.data.phaseType === PhaseType.PB) {
      return 3;
    } else {
      return 1;
    }
  }

  colSpanCount(params): number {
    if (params.data.programId === 'Total Funds Request' ||
      params.data.programId === 'Subtotal' ||
      params.data.programId === 'Remaining') {
      let columnsCount = 5;
      if (this.pr.type !== ProgramType.GENERIC) {
        columnsCount--;
      }
      if (!this.agGrid.columnApi.getColumn('fundingLine.opAgency').isVisible()) {
        columnsCount--;
      }
      return columnsCount;
    } else {
      return 1;
    }
  }

  generateDelta(pomFundinLine, pbFundinLine): FundingLine {
    let deltaFundingLine = JSON.parse(JSON.stringify(pomFundinLine));
    Object.keys(pomFundinLine.funds).forEach(year => {
      let total = pomFundinLine.funds[year] - pbFundinLine.funds[year] as number;
      deltaFundingLine.funds[year] = total;
    })
    return deltaFundingLine;
  }


  private async loadDropdownOptions() {
    this.appropriations = await this.tagsService.tagAbbreviationsForAppropriation();
    this.functionalAreas = await this.tagsService.tagAbbreviationsForFunctionalArea()
    let blins = await this.tagsService.tagAbbreviationsForBlin();
    let bas = await this.tagsService.tagAbbreviationsForBa();
    this.baOrBlins = blins.concat(bas);
  }

  private async getPBData(): Promise<Program> {
    const user: User = await this.globalsService.user().toPromise();
    const pb: PB = (await this.pbService.getLatest(user.currentCommunityId).toPromise()).result;
    let originalMrId;
    if (this.pr.type === ProgramType.GENERIC) {
      originalMrId = this.parentPr.originalMrId;
    } else {
      originalMrId = this.pr.originalMrId;
    }
    this.pbFy = pb.fy;

    if (!originalMrId) {
      return;
    }

    const pbPr: Program = (await this.prService.getByPhaseAndMrId(pb.id, originalMrId).toPromise()).result;

    if (!pbPr) {
      return; // there is no PB PR is the PR is created from the "Program of Record" or like "New Program"
    }
    return pbPr;
  }

  onBudgetYearValueChanged(params) {
    this.fieldedits = true;
    let year = params.colDef.colId;
    let pomNode = params.data;
    pomNode.fundingLine.funds[year] = Number(params.newValue);

    let displayModel = this.agGrid.api.getModel();
    let pbNode = displayModel.getRow(params.node.rowIndex - 1);
    if (pbNode !== undefined && pbNode.data.phaseType === PhaseType.PB) {
      let deltaNode = displayModel.getRow(params.node.rowIndex + 1);

      deltaNode.data.fundingLine = this.generateDelta(pomNode.fundingLine, pbNode.data.fundingLine);
    }
    this.agGrid.api.refreshCells();
    this.loadDropdownOptions();
    this.initPinnedBottomRows();
    this.isFundsTabValid[year] = {
      isValid: this.isValidBa(params.data.fundingLine.baOrBlin, year),
      baOrBlin: params.data.fundingLine.baOrBlin,
      year: year
    };
  }

  hasEditedValues(): boolean {
    return this.fieldedits;
  }

  onParentGridReady(params) {
    setTimeout(() => {
      this.agGridParent.api.setColumnDefs(this.columnDefs);
      this.agGridParent.columnApi.setColumnVisible('programId', true);
      this.agGridParent.api.setRowData(this.parentData);
      this.agGridParent.api.sizeColumnsToFit();
    }, 500);
    window.addEventListener("resize", function () {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  onSiblingsGridReady(params) {
    setTimeout(() => {
      this.agGridSiblings.api.setColumnDefs(this.columnDefs);
      this.agGridSiblings.columnApi.setColumnVisible('programId', true);
      this.agGridSiblings.api.setRowData(this.siblingsData);
      this.agGridSiblings.api.sizeColumnsToFit();
    }, 500);
    window.addEventListener("resize", function () {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  onGridReady(params) {
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 500);
    window.addEventListener("resize", () => {
      setTimeout(() => {
        this.agGrid.api.sizeColumnsToFit();
      });
    });
  }

  viewSiblings(fundingLine) {
    this.showSiblingsInformation = true;
    this.showParentInformation = true;
    this.initParentDataRows(fundingLine);
    this.initSiblingsDataRows(fundingLine);

  }

  closeParentInformation() {
    this.showParentInformation = false;
    setTimeout(() => {
      this.agGrid.api.sizeColumnsToFit();
    }, 500)
  }

  closeSiblingsInformation() {
    this.showSiblingsInformation = false;
    setTimeout(() => {
      this.agGrid.api.sizeColumnsToFit();
    }, 500)
  }

  delete(index) {
    let selectedFundingLine = this.data[index + 1].fundingLine;
    let isDeletable = true;
    this.prService.getSubProgramsById(this.pr.id).subscribe(data => {
      let subPrograms: Program[] = data.result;
      isDeletable = !subPrograms.some(sp => sp.fundingLines.some(fl => fl.appropriation === selectedFundingLine.appropriation &&
        fl.baOrBlin === selectedFundingLine.baOrBlin &&
        fl.item === selectedFundingLine.item &&
        fl.opAgency === selectedFundingLine.opAgency));
      if (isDeletable) {
        this.pr.fundingLines.splice(this.pr.fundingLines.indexOf(selectedFundingLine), 1);
        this.data.splice(index, 3);
        this.agGrid.api.setRowData(this.data);

        this.loadDropdownOptions();
        this.loadExistingFundingLines();

        this.initPinnedBottomRows();
        if (!this.data.some(row => row.fundingLine.userCreated === true)) {
          this.agGrid.columnApi.setColumnVisible('delete', false);
          if (this.agGridSiblings) {
            this.agGridSiblings.columnApi.setColumnVisible('delete', false);
            this.agGridSiblings.api.sizeColumnsToFit();
          }
          if (this.agGridParent) {
            this.agGridParent.columnApi.setColumnVisible('delete', false);
            this.agGridParent.api.sizeColumnsToFit();
          }
          this.agGrid.api.sizeColumnsToFit();
        }
      } else {
        Notify.error('Can\'t delete this funding line because is being used by one of the subprograms');
      }
    });
  }

  sizeColumnsToFit(params) {
    this.agGrid.api.sizeColumnsToFit();
  }

  onCellEditingStarted(params) {
    this.filterBlins(params.data.fundingLine.appropriation);
    this.agGrid.api.refreshCells();
  }

  onFundingLineValueChanged(params) {
    let pomNode = this.data[params.node.rowIndex + 1];
    if (params.colDef.headerName === 'Appn') {
      this.filterBlins(params.data.fundingLine.appropriation);
      params.data.fundingLine.item = null;
      params.data.fundingLine.baOrBlin = null;
    }
    if (params.data.fundingLine.appropriation === 'RDTE' && params.colDef.headerName === 'Item' && params.newValue !== '') {
      params.data.fundingLine.item = params.newValue + params.data.fundingLine.baOrBlin.replace(/[^1-9]/g, '');
    } else {
      if (params.data.fundingLine.appropriation && params.data.fundingLine.baOrBlin) {

        params.data.fundingLine.opAgency = PRUtils.getDefaultOpAgencyForLeadComponent(this.pr.leadComponent);
        this.agGrid.api.refreshCells();

        if (params.data.fundingLine.appropriation === 'RDTE') {
          params.data.fundingLine.item = this.pr.functionalArea + params.data.fundingLine.baOrBlin.replace(/[^1-9]/g, '');;
        }

        if (params.data.fundingLine.item) {
          this.autoValuesService.programElement(params.data.fundingLine.baOrBlin, params.data.fundingLine.item).then(pe => {
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
    this.agGrid.api.refreshCells();
  }

  isValidBa(ba: string, year: number): boolean {
    return this.isValidBaWithRespectToParent(ba, year) && this.isValidBaWithRespectToChildren(ba, year);
  }

  getValidationMessage(ba: string, year: number): string {
    if (!this.isValidBaWithRespectToChildren(ba, year)) {
      return 'The funding line amount can\'t be lower than the child subprograms';
    } else if (!this.isValidBaWithRespectToParent(ba, year)) {
      return 'The funding line amount can\'t be higher than the parent program';
    }
  }

  isValidBaWithRespectToParent(ba: string, year: number): boolean {
    if (this.parentPr) {
      return PRUtils.isParentBaSumGreater(ba, year, this.parentPr, this.pr, this.prs);
    } else {
      return true;
    }
  }

  isValidBaWithRespectToChildren(ba: string, year: number): boolean {
    return PRUtils.isChildrenBaSumSmaller(ba, year, this.pr, this.prs);
  }

  filterBlins(appropriation) {
    if ('PROC' === appropriation) {
      this.filteredBlins = this.baOrBlins.filter(baOrBlin => (baOrBlin.match(/00/)));
    } else {
      this.filteredBlins = this.baOrBlins.filter(baOrBlin => (baOrBlin.match(/BA[1-9]/)));
    }
    this.limitBaForLeadComponent()
    this.filteredBlins.unshift('');
  }

  limitBaForLeadComponent() {
    if (this.pr.leadComponent) {
      switch (this.pr.leadComponent) {
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
  }

  get validate(): Validation {
    let fundingLineAmount = this.isFundsTabValid.filter(value => value.isValid === false)[0];
    if (fundingLineAmount && !fundingLineAmount.isValid) {
      return new Validation(false, this.getValidationMessage(fundingLineAmount.baOrBlin, fundingLineAmount.year))
    } else if (this.flHaveIncorrectBa()) {
      return new Validation(false, 'You have a duplicate in the BA/Blin column. Changes were not saved');
    } else if (this.flHaveIncorrectAppropriation()) {
      return new Validation(false, 'You can only have one funding line with the PROC appropriation. Changes were not saved');
    } else if (this.flHaveEmptyFields()) {
      return new Validation(false, 'You must fill all the fields for a funding line. Changes were not saved');
    } else {
      return new Validation(true);
    }
  }

  flHaveIncorrectAppropriation(): Boolean {
    let count = 0;
    this.pr.fundingLines.forEach(function (fl) {
      if (fl.appropriation === 'PROC') {
        count++;
      }
    });
    return count > 1;
  }

  flHaveEmptyFields(): Boolean {
    let hasEmptyFields = false;
    this.pr.fundingLines.forEach(function (fl) {
      if (!fl.baOrBlin || !fl.appropriation || !fl.item) {
        hasEmptyFields = true;
      }
    });
    return hasEmptyFields;
  }

  flHaveIncorrectBa(): Boolean{
    let duplicatesExist = false;
    let result = [];
    this.pr.fundingLines.forEach(function(fl, index) {
      if (!result[fl.baOrBlin]) {
        result[fl.baOrBlin] = index;
      } else {
        duplicatesExist = true;
      }
    });
    return duplicatesExist;
  }

  flHaveValues(): boolean {
    var ok: boolean = (this.pr.fundingLines.length > 0);
    this.pr.fundingLines.forEach(function (fl, index) {
      var flok: boolean = false;
      Object.getOwnPropertyNames(fl.funds).forEach(key => {
        if (0 !== fl.funds[key]) {
          flok = true;
        }
      });

      ok = (ok && flok);
    });

    return ok;
  }
}
