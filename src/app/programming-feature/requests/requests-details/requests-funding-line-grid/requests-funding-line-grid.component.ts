import { Component, Input, OnInit } from '@angular/core';
import { ColGroupDef, ColumnApi, GridApi, GroupCellRenderer } from '@ag-grid-community/all-modules';
import { DataGridMessage } from '../../../../pfm-coreui/models/DataGridMessage';
import { ActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { NumericCellEditor } from 'src/app/ag-grid/cell-editors/NumericCellEditor';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { Program } from 'src/app/programming-feature/models/Program';
import { FundingLineService } from 'src/app/programming-feature/services/funding-line.service';
import { FundingData } from 'src/app/programming-feature/models/funding-data.model';
import { map } from 'rxjs/operators';
import { FundingLine } from 'src/app/programming-feature/models/funding-line.model';
import { Observable } from 'rxjs';
import { PropertyService } from '../../../services/property.service';
import { PropertyType } from '../../../models/enumerations/property-type.model';
import { Property } from '../../../models/property.model';
import { Appropriation } from '../../../models/appropriation.model';
import { BaBlin } from '../../../models/ba-blin.model';
import { SAG } from '../../../models/sag.model';
import { ExpenditureType } from '../../../models/expenditure-type.model';
import { WorkUnitCode } from '../../../models/work-unit-code.model';
import { RestResponse } from 'src/app/util/rest-response';
import { DropdownCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/dropdown-cell-renderer/dropdown-cell-renderer.component';

@Component({
  selector: 'pfm-requests-funding-line-grid',
  templateUrl: './requests-funding-line-grid.component.html',
  styleUrls: ['./requests-funding-line-grid.component.scss']
})
export class RequestsFundingLineGridComponent implements OnInit {
  @Input() pomYear: number;
  @Input() program: Program;

  actionState = {
    VIEW: {
      canSave: false,
      canEdit: true,
      canDelete: true,
      canUpload: false,
      isSingleDelete: true
    },
    VIEW_NO_DELETE: {
      canSave: false,
      canEdit: true,
      canDelete: false,
      canUpload: false,
      isSingleDelete: true
    },
    EDIT: {
      canEdit: false,
      canSave: true,
      canDelete: true,
      canUpload: false,
      isSingleDelete: true
    }
  };

  showSubtotals: boolean;

  summaryFundingLineRows: any[] = [];
  summaryFundingLineGridApi: GridApi;
  summaryFundingLineColumnsDefinition: any[];
  columnApi: ColumnApi;
  autoGroupColumnDef: any;

  id = 'requests-funding-line-grid-component';
  busy: boolean;

  nonSummaryFundingLineGridApi: GridApi;
  nonSummaryFundingLineRows: FundingData[] = [];
  nonSummaryFundingLineColumnsDefinition: ColGroupDef[];

  currentNonSummaryRowDataState: RowDataStateInterface = {};
  currentSummaryRowDataState: RowDataStateInterface = {};
  deleteDialog: DeleteDialogInterface = { title: 'Delete' };
  expanded: boolean;

  appnOptions = [];
  allBaBlins = [];
  baOptions = [];
  sagOptions = [];
  wucdOptions = [];
  expTypeOptions = [];

  constructor(
    private dialogService: DialogService,
    private propertyService: PropertyService,
    private fundingLineService: FundingLineService
  ) {}

  ngOnInit() {
    this.setupSummaryFundingLineGrid();
    this.setupNonSummaryFundingLineGrid();
    this.loadDropDownValues();
  }

  onNonSummaryGridIsReady(api: GridApi) {
    this.nonSummaryFundingLineGridApi = api;
    this.nonSummaryFundingLineRows = [];
    this.resetTotalFunding();
    this.nonSummaryFundingLineRows.splice(1, 0, ...this.summaryFundingLineRows);
    this.updateTotalFields();
    if (this.nonSummaryFundingLineRows.length === 1) {
      this.loadDataFromProgram();
    }
  }

  onSummaryGridReady(api: GridApi) {
    this.summaryFundingLineGridApi = api;
    this.summaryFundingLineRows = [...this.nonSummaryFundingLineRows.filter((x, index) => index > 0)];
    this.updateSummaryTotalFields();
    this.summaryFundingLineGridApi.setRowData(this.summaryFundingLineRows);
  }

  onToggleValueChanged(value) {
    this.showSubtotals = value;
    if (this.showSubtotals) {
      if (this.nonSummaryFundingLineGridApi.getEditingCells().length) {
        this.performNonSummaryCancel(this.nonSummaryFundingLineGridApi.getEditingCells()[0].rowIndex);
      }
    } else {
      if (this.summaryFundingLineGridApi.getEditingCells().length) {
        const gridApiRowIndex = this.summaryFundingLineGridApi.getEditingCells()[0].rowIndex;
        if (gridApiRowIndex) {
          this.performSummaryCancel(gridApiRowIndex);
        }
      }
      this.collapse();
    }
  }

  private loadDropDownValues() {
    this.propertyService
      .getByType(PropertyType.APPROPRIATION)
      .subscribe((res: RestResponse<Property<Appropriation>[]>) => {
        this.appnOptions = res.result.map(x => x.value).map(x => x.appropriation);
      });

    this.propertyService.getByType(PropertyType.BA_BLIN).subscribe((res: RestResponse<Property<BaBlin>[]>) => {
      this.allBaBlins = res.result.map(x => x.value);
    });

    this.propertyService.getByType(PropertyType.SAG).subscribe((res: RestResponse<Property<SAG>[]>) => {
      this.sagOptions = res.result.map(x => x.value).map(x => x.sag);
    });
    this.propertyService
      .getByType(PropertyType.WORK_UNIT_CODE)
      .subscribe((res: RestResponse<Property<WorkUnitCode>[]>) => {
        this.wucdOptions = res.result.map(x => x.value).map(x => x.workUnitCode);
      });

    this.propertyService
      .getByType(PropertyType.EXPENDITURE_TYPE)
      .subscribe((res: RestResponse<Property<ExpenditureType>[]>) => {
        this.expTypeOptions = res.result.map(x => x.value).map(x => x.code);
      });
  }

  private loadDataFromProgram() {
    this.fundingLineService
      .obtainFundingLinesByProgramId(this.program.id)
      .pipe(map(resp => this.convertFundsToFiscalYear(resp)))
      .subscribe(resp => {
        const fundingLine = resp as FundingData[];
        this.resetTotalFunding();
        this.nonSummaryFundingLineRows.push(...fundingLine);
        this.updateTotalFields();
        this.nonSummaryFundingLineGridApi.setRowData(this.nonSummaryFundingLineRows);
      });
  }

  private convertFundsToFiscalYear(response: any) {
    const ret: FundingData[] = [];
    if (response.result) {
      response.result.forEach(fundingLine => {
        ret.push(this.fundingLineToFundingData(fundingLine));
      });
    }
    return ret;
  }

  private fundingLineToFundingData(fundingLine: FundingLine) {
    const funds = fundingLine.funds;
    const fundingData = { ...fundingLine } as FundingData;
    for (let i = this.pomYear - 3, x = 0; i < this.pomYear + 6; i++, x++) {
      const headerName = (i < this.pomYear - 1
        ? 'PY' + (this.pomYear - i === 2 ? '' : this.pomYear - i - 2)
        : i >= this.pomYear
        ? 'BY' + (i === this.pomYear ? '' : i - this.pomYear)
        : 'CY'
      ).toLowerCase();
      fundingData[headerName] = funds[i] ? funds[i] : 0;
    }
    fundingData.action = fundingLine.userCreated ? this.actionState.VIEW : this.actionState.VIEW_NO_DELETE;
    return fundingData;
  }

  private convertFiscalYearToFunds(fundingLine: FundingData) {
    const fundingLineToSave: FundingLine = { ...fundingLine };
    fundingLineToSave.funds = {};
    for (let i = this.pomYear - 2, x = 0; i < this.pomYear + 6; i++, x++) {
      const headerName = (i < this.pomYear
        ? 'PY' + (this.pomYear - i === 1 ? '' : this.pomYear - i - 1)
        : i > this.pomYear
        ? 'BY' + (i === this.pomYear + 1 ? '' : i - this.pomYear - 1)
        : 'CY'
      ).toLowerCase();
      fundingLineToSave.funds[i] = Number(fundingLine[headerName]);
    }
    fundingLineToSave.ctc = Number(fundingLine.ctc);
    return fundingLineToSave;
  }

  private setupSummaryFundingLineGrid() {
    const columnGroups: any[] = [];
    for (let i = this.pomYear - 2, x = 0; i < this.pomYear + 6; i++, x++) {
      const headerName =
        i < this.pomYear
          ? 'PY' + (this.pomYear - i === 1 ? '' : '-' + (this.pomYear - i - 1))
          : i > this.pomYear
          ? 'BY' + (i === this.pomYear + 1 ? '' : '+' + (i - this.pomYear - 1))
          : 'CY';
      const fieldPrefix = headerName.toLowerCase().replace('+', '').replace('-', '');
      columnGroups.push({
        groupId: 'main-header',
        headerName,
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            colId: 5 + x,
            headerName: 'FY' + (i - (1 % 100)),
            field: fieldPrefix,
            editable: i > this.pomYear,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            aggFunc: 'sum',
            cellEditor: NumericCellEditor.create({ returnUndefinedOnZero: false }),
            cellClass: params => ['numeric-class', params.node.group ? 'aggregate-cell' : 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
            minWidth: 80,
            valueFormatter: params => this.currencyFormatter(params.value)
          }
        ]
      });
    }
    this.summaryFundingLineColumnsDefinition = [
      {
        colId: 0,
        headerName: 'APPN',
        showRowGroup: 'appropriation',
        cellRenderer: GroupCellRenderer,
        cellRendererParams: {
          footerValueGetter: '"Total Funding"'
        },
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        cellClass: params => ['numeric-class', params.node.group ? 'aggregate-cell' : 'regular-cell'],
        maxWidth: 110,
        minWidth: 110
      },
      {
        colId: 1,
        headerName: 'BA/BLIN',
        showRowGroup: 'baOrBlin',
        cellRenderer: GroupCellRenderer,
        cellRendererParams: {
          footerValueGetter: '""'
        },
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        cellClass: params => ['numeric-class', params.node.group ? 'aggregate-cell' : 'regular-cell'],
        maxWidth: 110,
        minWidth: 110
      },
      {
        colId: 2,
        headerName: 'SAG',
        showRowGroup: 'sag',
        cellRenderer: GroupCellRenderer,
        cellRendererParams: {
          footerValueGetter: '""'
        },
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        cellClass: params => ['numeric-class', params.node.group ? 'aggregate-cell' : 'regular-cell'],
        maxWidth: 110,
        minWidth: 110
      },
      {
        colId: 3,
        headerName: 'WUCD',
        showRowGroup: 'wucd',
        cellRenderer: GroupCellRenderer,
        cellRendererParams: {
          footerValueGetter: '""'
        },
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        cellClass: params => ['numeric-class', params.node.group ? 'aggregate-cell' : 'regular-cell'],
        maxWidth: 110,
        minWidth: 110
      },
      {
        colId: 4,
        headerName: 'Exp Type',
        field: 'expenditureType',
        cellRendererParams: {
          footerValueGetter: '""'
        },
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        cellClass: params => ['numeric-class', params.node.group ? 'aggregate-cell' : 'regular-cell'],
        maxWidth: 110,
        minWidth: 110
      },
      {
        field: 'appropriation',
        rowGroup: true,
        hide: true
      },
      {
        field: 'baOrBlin',
        rowGroup: true,
        hide: true
      },
      {
        field: 'sag',
        rowGroup: true,
        hide: true
      },
      {
        field: 'wucd',
        rowGroup: true,
        hide: true
      },
      ...columnGroups,
      {
        colId: 13,
        headerName: 'FY Total',
        field: 'fyTotal',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        aggFunc: 'sum',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        cellClass: params => ['numeric-class', params.node.group ? 'aggregate-cell' : 'regular-cell'],
        minWidth: 80,
        valueFormatter: params => this.currencyFormatter(params.value)
      },
      {
        colId: 14,
        headerName: 'CTC',
        field: 'ctc',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        aggFunc: 'sum',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        cellClass: params => ['numeric-class', params.node.group ? 'aggregate-cell' : 'regular-cell'],
        minWidth: 80,
        cellEditor: NumericCellEditor.create({ returnUndefinedOnZero: false }),
        valueFormatter: params => this.currencyFormatter(params.value)
      },
      {
        headerName: 'Actions',
        field: 'action',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['numeric-class', params.node.group ? 'aggregate-cell' : 'regular-cell'],
        cellRendererFramework: ActionCellRendererComponent,
        minWidth: 120
      }
    ];
  }

  onNonSummaryCellAction(cellAction: DataGridMessage) {
    switch (cellAction.message) {
      case 'save':
        this.saveRow(cellAction.rowIndex);
        break;
      case 'edit':
        if (!this.currentNonSummaryRowDataState.isEditMode) {
          this.editRow(cellAction.rowIndex, true);
        }
        break;
      case 'delete-row':
        if (!this.currentNonSummaryRowDataState.isEditMode) {
          this.deleteDialog.bodyText =
            'You will be permanently deleting the row from the grid.  Are you sure you want to delete this row?';
          this.displayDeleteDialog(cellAction, this.deleteRow.bind(this));
        }
        break;
      case 'cancel':
        this.performNonSummaryCancel(cellAction.rowIndex);
        break;
    }
  }

  private performNonSummaryCancel(rowIndex: number) {
    if (this.currentNonSummaryRowDataState.isEditMode && !this.currentNonSummaryRowDataState.isAddMode) {
      this.cancelRow(rowIndex);
    } else {
      this.deleteRow(rowIndex);
    }
  }

  onSummaryCellAction(cellAction: DataGridMessage) {
    const row = this.summaryFundingLineGridApi.getModel().getRow(cellAction.rowIndex);
    if (row) {
      const rowIndex = Number(row.id);
      switch (cellAction.message) {
        case 'save':
          this.saveSummaryRow(rowIndex, cellAction.rowIndex);
          break;
        case 'edit':
          if (!this.currentSummaryRowDataState.isEditMode) {
            this.editSummaryRow(rowIndex, cellAction.rowIndex, true);
          }
          break;
        case 'delete-row':
          if (!this.currentSummaryRowDataState.isEditMode) {
            cellAction.rowIndex = rowIndex;
            this.deleteDialog.bodyText =
              'You will be permanently deleting the row from the grid.  Are you sure you want to delete this row?';
            this.displayDeleteDialog(cellAction, this.deleteSummaryRow.bind(this));
          }
          break;
        case 'cancel':
          this.performSummaryCancel(cellAction.rowIndex);
          break;
      }
    }
  }

  performSummaryCancel(gridApiRowIndex: number) {
    const dataId = this.summaryFundingLineGridApi.getDisplayedRowAtIndex(gridApiRowIndex).data.id;
    const rowIndex = this.summaryFundingLineRows.findIndex(row => row.id === dataId);
    if (this.currentSummaryRowDataState.isEditMode && !this.currentSummaryRowDataState.isAddMode) {
      this.cancelSummaryRow(rowIndex);
    }
  }

  onColumnIsReady(columnApi: ColumnApi) {
    this.columnApi = columnApi;
  }

  private setupNonSummaryFundingLineGrid() {
    const columnGroups: any[] = [];
    for (let i = this.pomYear - 2, x = 0; i < this.pomYear + 6; i++, x++) {
      const headerName =
        i < this.pomYear
          ? 'PY' + (this.pomYear - i === 1 ? '' : '-' + (this.pomYear - i - 1))
          : i > this.pomYear
          ? 'BY' + (i === this.pomYear + 1 ? '' : '+' + (i - this.pomYear - 1))
          : 'CY';
      const fieldPrefix = headerName.toLowerCase().replace('+', '').replace('-', '');
      columnGroups.push({
        groupId: 'main-header',
        headerName,
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            colId: 4 + x,
            headerName: 'FY' + (i - (1 % 100)),
            field: fieldPrefix,
            editable: i > this.pomYear,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['numeric-class', params.rowIndex === 0 ? 'aggregate-cell' : 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
            minWidth: 80,
            cellEditor: NumericCellEditor.create({ returnUndefinedOnZero: false }),
            valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
          }
        ]
      });
    }
    this.nonSummaryFundingLineColumnsDefinition = [
      {
        groupId: 'main-header',
        headerName: 'Funds in $K',
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            colId: 0,
            headerName: 'APPN',
            field: 'appropriation',
            editable: params => params.data.userCreated,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', params.rowIndex === 0 ? 'aggregate-cell' : 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: ['Select', ...this.appnOptions]
              };
            }
          },
          {
            colId: 1,
            headerName: 'BA/BLIN',
            field: 'baOrBlin',
            editable: params => params.data.userCreated,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', params.rowIndex === 0 ? 'aggregate-cell' : 'regular-cell'],
            cellStyle: {
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'flex-start',
              'white-space': 'normal'
            },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [
                  'Select',
                  ...this.allBaBlins.filter(x => params.data.appropriation === x.appropriation).map(x => x.code)
                ]
              };
            }
          },
          {
            colId: 2,
            headerName: 'SAG',
            field: 'sag',
            editable: params => params.data.userCreated,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', params.rowIndex === 0 ? 'aggregate-cell' : 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: ['Select', ...new Set(this.sagOptions)]
              };
            }
          },
          {
            colId: 3,
            headerName: 'WUCD',
            field: 'wucd',
            editable: params => params.data.userCreated,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', params.rowIndex === 0 ? 'aggregate-cell' : 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: ['Select', ...this.wucdOptions]
              };
            }
          },
          {
            colId: 4,
            headerName: 'EXP Type',
            field: 'expenditureType',
            editable: params => params.data.userCreated,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', params.rowIndex === 0 ? 'aggregate-cell' : 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: ['Select', ...this.expTypeOptions]
              };
            }
          }
        ]
      },
      ...columnGroups,
      {
        headerName: 'FY Total',
        field: 'fyTotal',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['numeric-class', params.rowIndex === 0 ? 'aggregate-cell' : 'regular-cell'],
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        minWidth: 80,
        valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
      },
      {
        headerName: 'CTC',
        field: 'ctc',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['numeric-class', params.rowIndex === 0 ? 'aggregate-cell' : 'regular-cell'],
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        minWidth: 80,
        cellEditor: NumericCellEditor.create({ returnUndefinedOnZero: false }),
        valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
      },
      {
        headerName: 'Actions',
        field: 'action',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => (params.rowIndex === 0 ? 'aggregate-cell' : 'regular-cell'),
        cellRendererFramework: ActionCellRendererComponent,
        minWidth: 120
      }
    ];
    this.resetTotalFunding();
  }

  private resetTotalFunding() {
    this.nonSummaryFundingLineRows[0] = {
      appropriation: 'Total Funding',

      py1: 0,
      py: 0,
      cy: 0,
      by: 0,
      by1: 0,
      by2: 0,
      by3: 0,
      by4: 0,

      fyTotal: 0,
      ctc: 0,

      action: null
    };
  }

  currencyFormatter(params) {
    return (
      '$ ' +
      Number(params)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    );
  }

  onNonSummaryRowAdd(params) {
    if (this.currentNonSummaryRowDataState.isEditMode) {
      return;
    }
    this.nonSummaryFundingLineRows.push({
      appropriation: '0',
      baOrBlin: '0',
      sag: '0',
      wucd: '0',
      expenditureType: '0',
      userCreated: true,

      py1: 0,
      py: 0,
      cy: 0,
      by: 0,
      by1: 0,
      by2: 0,
      by3: 0,
      by4: 0,

      fyTotal: 0,
      ctc: 0,
      action: this.actionState.EDIT
    });
    this.currentNonSummaryRowDataState.isAddMode = true;
    this.nonSummaryFundingLineGridApi.setRowData(this.nonSummaryFundingLineRows);
    this.editRow(this.nonSummaryFundingLineRows.length - 1);
  }

  private saveRow(rowIndex: number) {
    this.nonSummaryFundingLineGridApi.stopEditing();
    const row = this.nonSummaryFundingLineRows[rowIndex];
    const canSave = this.validateNonSummaryRowData(rowIndex);
    if (canSave) {
      const fundingLine = this.convertFiscalYearToFunds(row);
      fundingLine.programId = this.program.id;
      if (this.currentNonSummaryRowDataState.isAddMode) {
        this.performNonSummarySave(
          this.fundingLineService.createFundingLine.bind(this.fundingLineService),
          fundingLine,
          rowIndex
        );
      } else {
        this.performNonSummarySave(
          this.fundingLineService.updateFundingLine.bind(this.fundingLineService),
          fundingLine,
          rowIndex
        );
      }
    } else {
      this.editRow(rowIndex);
    }
  }

  private performNonSummarySave(
    saveOrUpdate: (fundingLine: FundingLine) => Observable<any>,
    fundingLine: FundingLine,
    rowIndex: number
  ) {
    saveOrUpdate(fundingLine)
      .pipe(map(resp => this.fundingLineToFundingData(resp.result)))
      .subscribe(
        fundingData => {
          this.nonSummaryFundingLineRows[rowIndex] = fundingData;
          this.updateTotalFields();
          this.viewNonSummaryMode(rowIndex);
        },
        error => {
          this.dialogService.displayDebug(error);
          this.editRow(rowIndex);
        }
      );
  }

  private updateTotalFields() {
    this.resetTotalFunding();
    this.nonSummaryFundingLineRows
      .filter((row, index) => index > 0)
      .forEach(row => {
        let total = 0;
        row.ctc = row.ctc ? row.ctc : 0;
        for (let i = this.pomYear - 2; i < this.pomYear + 6; i++) {
          const field =
            i < this.pomYear
              ? 'py' + (this.pomYear - i === 1 ? '' : this.pomYear - i - 1)
              : i > this.pomYear
              ? 'by' + (i === this.pomYear + 1 ? '' : i - this.pomYear - 1)
              : 'cy';
          this.nonSummaryFundingLineRows[0][field] += Number(row[field]);
          if (i > this.pomYear) {
            total += Number(row[field]);
          }
        }
        row.fyTotal = total;
        this.nonSummaryFundingLineRows[0].ctc += Number(row.ctc);
        this.nonSummaryFundingLineRows[0].fyTotal += Number(row.fyTotal);
      });
  }

  private validateNonSummaryRowData(rowIndex: any) {
    const row = this.nonSummaryFundingLineRows[rowIndex];
    let errorMessage = '';

    if (row.appropriation && (!row.appropriation.length || row.appropriation.toLowerCase() === 'select')) {
      errorMessage = 'Please, select an APPN.';
    } else if (row.baOrBlin && (!row.baOrBlin.length || row.baOrBlin.toLowerCase() === 'select')) {
      errorMessage = 'Please, select a BA/BLIN.';
    } else if (row.sag && (!row.sag.length || row.sag.toLowerCase() === 'select')) {
      errorMessage = 'Please, select a SAG.';
    } else if (row.wucd && (!row.wucd.length || row.wucd.toLowerCase() === 'select')) {
      errorMessage = 'Please, select a WUCD.';
    } else if (row.expenditureType && (!row.expenditureType.length || row.expenditureType.toLowerCase() === 'select')) {
      errorMessage = 'Please, select a Exp Type.';
    } else if (
      this.nonSummaryFundingLineRows.some((fundingLine, idx) => {
        return (
          idx !== rowIndex &&
          fundingLine.appropriation === row.appropriation &&
          fundingLine.baOrBlin === row.baOrBlin &&
          fundingLine.sag === row.sag &&
          fundingLine.wucd === row.wucd &&
          fundingLine.expenditureType === row.expenditureType
        );
      })
    ) {
      errorMessage = 'You have repeated an existing funding line.  Please delete this row and edit the existing line.';
    }
    if (errorMessage.length) {
      this.dialogService.displayError(errorMessage);
    }
    return !errorMessage.length;
  }

  private cancelRow(rowIndex: number) {
    this.nonSummaryFundingLineRows[rowIndex] = this.currentNonSummaryRowDataState.currentEditingRowData;
    this.viewNonSummaryMode(rowIndex);
  }

  private editRow(rowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.currentNonSummaryRowDataState.currentEditingRowData = { ...this.nonSummaryFundingLineRows[rowIndex] };
    }
    this.editNonSummaryMode(rowIndex);
    this.setupAppnDependency();
  }

  private deleteRow(rowIndex: number) {
    if (this.nonSummaryFundingLineRows[rowIndex].id) {
      this.fundingLineService.removeFundingLineById(this.nonSummaryFundingLineRows[rowIndex].id).subscribe(
        () => {
          this.performNonSummaryDelete(rowIndex);
          this.updateTotalFields();
        },
        error => {
          this.dialogService.displayDebug(error);
        }
      );
    } else {
      this.performNonSummaryDelete(rowIndex);
    }
  }

  private performNonSummaryDelete(rowIndex: number) {
    this.nonSummaryFundingLineRows.splice(rowIndex, 1);
    this.currentNonSummaryRowDataState.currentEditingRowIndex = 0;
    this.currentNonSummaryRowDataState.isEditMode = false;
    this.currentNonSummaryRowDataState.isAddMode = false;
    this.nonSummaryFundingLineGridApi.stopEditing();
    this.nonSummaryFundingLineRows.forEach(row => {
      row.isDisabled = false;
    });
    this.nonSummaryFundingLineGridApi.setRowData(this.nonSummaryFundingLineRows);
  }

  private viewNonSummaryMode(rowIndex: number) {
    this.currentNonSummaryRowDataState.currentEditingRowIndex = 0;
    this.currentNonSummaryRowDataState.isEditMode = false;
    this.currentNonSummaryRowDataState.isAddMode = false;
    this.nonSummaryFundingLineGridApi.stopEditing();
    this.nonSummaryFundingLineRows[rowIndex].action = this.nonSummaryFundingLineRows[rowIndex].userCreated
      ? this.actionState.VIEW
      : this.actionState.VIEW_NO_DELETE;
    this.nonSummaryFundingLineRows.forEach(row => {
      row.isDisabled = false;
    });
    this.nonSummaryFundingLineGridApi.setRowData(this.nonSummaryFundingLineRows);
  }

  private editNonSummaryMode(rowIndex: number) {
    this.currentNonSummaryRowDataState.currentEditingRowIndex = rowIndex;
    this.currentNonSummaryRowDataState.isEditMode = true;
    this.nonSummaryFundingLineRows[rowIndex].action = this.actionState.EDIT;
    this.nonSummaryFundingLineRows.forEach((row, index) => {
      if (rowIndex !== index) {
        row.isDisabled = true;
      }
    });
    this.nonSummaryFundingLineGridApi.setRowData(this.nonSummaryFundingLineRows);
    this.nonSummaryFundingLineGridApi.startEditingCell({
      rowIndex,
      colKey: '0'
    });
  }

  private saveSummaryRow(rowIndex: number, gridApiRowIndex: number) {
    this.summaryFundingLineGridApi.stopEditing();
    const row = this.summaryFundingLineRows[rowIndex];
    const fundingLine = this.convertFiscalYearToFunds(row);
    if (this.currentSummaryRowDataState.isEditMode) {
      this.fundingLineService
        .updateFundingLine(fundingLine)
        .pipe(map(resp => this.fundingLineToFundingData(resp.result)))
        .subscribe(
          fundingData => {
            this.summaryFundingLineRows[rowIndex] = fundingData;
            this.updateSummaryTotalFields();
            this.viewSummaryMode(rowIndex);
          },
          error => {
            this.dialogService.displayDebug(error);
            this.editSummaryRow(rowIndex, gridApiRowIndex);
          }
        );
    }
  }

  private updateSummaryTotalFields() {
    this.summaryFundingLineRows.forEach(row => {
      let total = 0;
      for (let i = this.pomYear + 1; i < this.pomYear + 6; i++) {
        const field =
          i < this.pomYear
            ? 'py' + (this.pomYear - i === 1 ? '' : this.pomYear - i - 1)
            : i > this.pomYear
            ? 'by' + (i === this.pomYear + 1 ? '' : i - this.pomYear - 1)
            : 'cy';
        row[field] = Number(row[field]);
        if (i > this.pomYear) {
          total += Number(row[field]);
        }
      }
      row.ctc = Number(row.ctc);
      row.fyTotal = total;
    });
  }

  private cancelSummaryRow(rowIndex: number) {
    this.summaryFundingLineRows[rowIndex] = this.currentSummaryRowDataState.currentEditingRowData;
    this.viewSummaryMode(rowIndex);
  }

  private editSummaryRow(rowIndex: number, gridApiRowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.currentSummaryRowDataState.currentEditingRowData = { ...this.summaryFundingLineRows[rowIndex] };
    }
    this.editSummaryMode(rowIndex, gridApiRowIndex);
  }

  private deleteSummaryRow(rowIndex: number) {
    if (this.summaryFundingLineRows[rowIndex].id) {
      this.fundingLineService.removeFundingLineById(this.summaryFundingLineRows[rowIndex].id).subscribe(
        () => {
          this.summaryFundingLineRows.splice(rowIndex, 1);
          this.updateSummaryTotalFields();
          this.summaryFundingLineGridApi.setRowData(this.summaryFundingLineRows);
          this.summaryFundingLineGridApi.refreshClientSideRowModel('aggregate');
        },
        error => {
          this.dialogService.displayDebug(error);
        }
      );
    }
  }

  private viewSummaryMode(rowIndex: number) {
    this.currentSummaryRowDataState.currentEditingRowIndex = 0;
    this.currentSummaryRowDataState.isEditMode = false;
    this.currentSummaryRowDataState.isAddMode = false;
    this.summaryFundingLineGridApi.stopEditing();
    this.summaryFundingLineRows[rowIndex].action = this.summaryFundingLineRows[rowIndex].userCreated
      ? this.actionState.VIEW
      : this.actionState.VIEW_NO_DELETE;
    this.summaryFundingLineRows.forEach(row => {
      row.isDisabled = false;
    });
    this.summaryFundingLineGridApi.setRowData(this.summaryFundingLineRows);
  }

  private editSummaryMode(rowIndex: number, gridApiRowIndex: number) {
    this.currentSummaryRowDataState.currentEditingRowIndex = gridApiRowIndex;
    this.currentSummaryRowDataState.isEditMode = true;
    this.summaryFundingLineRows[rowIndex].action = this.actionState.EDIT;
    this.summaryFundingLineRows.forEach((row, index) => {
      if (rowIndex !== index) {
        row.isDisabled = true;
      }
    });
    this.summaryFundingLineGridApi.setRowData(this.summaryFundingLineRows);
    this.summaryFundingLineGridApi.startEditingCell({
      rowIndex: gridApiRowIndex,
      colKey: '8'
    });
  }

  headerClassFunc(params: any) {
    let isMainHeader = false;
    let column = params.column ? params.column : params.columnGroup;
    while (column) {
      if (column.getDefinition().groupId === 'main-header') {
        isMainHeader = true;
      }
      column = column.getParent();
    }
    if (isMainHeader) {
      return 'main-header';
    } else {
      return null;
    }
  }

  onNonSummaryMouseDown(mouseEvent: MouseEvent) {
    if (this.currentNonSummaryRowDataState.isEditMode) {
      this.nonSummaryFundingLineGridApi.startEditingCell({
        rowIndex: this.currentNonSummaryRowDataState.currentEditingRowIndex,
        colKey: '0'
      });
      this.setupAppnDependency();
    }
  }

  onSummaryMouseDown(mouseEvent: MouseEvent) {
    if (this.currentSummaryRowDataState.isEditMode) {
      this.summaryFundingLineGridApi.startEditingCell({
        rowIndex: this.currentSummaryRowDataState.currentEditingRowIndex,
        colKey: '8'
      });
    }
  }

  private displayDeleteDialog(cellAction: DataGridMessage, deleteFunction: (rowIndex: number) => void) {
    this.deleteDialog.cellAction = cellAction;
    this.deleteDialog.delete = deleteFunction;
    this.deleteDialog.display = true;
  }

  onCancelDeleteDialog() {
    this.closeDeleteDialog();
  }

  onDeleteData() {
    this.deleteDialog.delete(this.deleteDialog.cellAction.rowIndex);
    this.closeDeleteDialog();
  }

  private closeDeleteDialog() {
    this.deleteDialog.cellAction = null;
    this.deleteDialog.delete = null;
    this.deleteDialog.display = false;
  }

  collapse() {
    this.expanded = false;
    this.summaryFundingLineGridApi.collapseAll();
  }

  expand() {
    this.expanded = true;
    this.summaryFundingLineGridApi.expandAll();
  }

  setupAppnDependency() {
    const appnCell = this.nonSummaryFundingLineGridApi.getEditingCells()[0];
    const baBlinCell = this.nonSummaryFundingLineGridApi.getEditingCells()[1];

    const appnCellEditor = this.nonSummaryFundingLineGridApi.getCellEditorInstances({
      columns: [appnCell.column]
    })[0] as any;

    const bablinCellEditor = this.nonSummaryFundingLineGridApi.getCellEditorInstances({
      columns: [baBlinCell.column]
    })[0] as any;

    const appnDropdownComponent = appnCellEditor._frameworkComponentInstance as DropdownCellRendererComponent;
    if (appnDropdownComponent) {
      const baBlinDropdownComponent = bablinCellEditor._frameworkComponentInstance as DropdownCellRendererComponent;

      appnDropdownComponent.change.subscribe(() => {
        const list = [
          'Select',
          ...this.allBaBlins.filter(x => appnDropdownComponent.selectedValue === x.appropriation).map(x => x.code)
        ];
        baBlinDropdownComponent.updateList(list);
      });
    }
  }
}

export interface RowDataStateInterface {
  currentEditingRowIndex?: number;
  isAddMode?: boolean;
  isEditMode?: boolean;
  currentEditingRowData?: any;
}

export interface DeleteDialogInterface {
  title: string;
  bodyText?: string;
  display?: boolean;
  cellAction?: DataGridMessage;
  delete?: (rowIndex: number) => void;
}
