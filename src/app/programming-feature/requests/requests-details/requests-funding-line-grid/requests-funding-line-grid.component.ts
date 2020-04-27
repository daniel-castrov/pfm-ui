import { Component, Input, OnInit, ViewChild } from '@angular/core';
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
import { GoogleChartComponent, GoogleChartInterface } from 'ng2-google-charts';
import { ListItem } from 'src/app/pfm-common-models/ListItem';
import { DropdownComponent } from 'src/app/pfm-coreui/form-inputs/dropdown/dropdown.component';

@Component({
  selector: 'pfm-requests-funding-line-grid',
  templateUrl: './requests-funding-line-grid.component.html',
  styleUrls: ['./requests-funding-line-grid.component.scss']
})
export class RequestsFundingLineGridComponent implements OnInit {
  @ViewChild('googleChart')
  chart: GoogleChartComponent;
  @ViewChild('displayDropdown')
  displayDropdown: DropdownComponent;
  @ViewChild('appropriationDropdown')
  appropriationDropdown: DropdownComponent;
  @ViewChild('bablinDropdown')
  bablinDropdown: DropdownComponent;
  @ViewChild('sagDropdown')
  sagDropdown: DropdownComponent;
  @ViewChild('wucdDropdown')
  wucdDropdown: DropdownComponent;
  @ViewChild('expTypeDropdown')
  expTypeDropdown: DropdownComponent;
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

  chartData: GoogleChartInterface = {
    chartType: 'LineChart',
    options: {
      title: 'Funding Lines',
      width: 1000,
      height: 350,
      chartArea: {
        width: '50%',
        height: '70%',
        left: '15%'
      },
      series: {
        0: {
          type: 'line'
        },
        1: {
          type: 'line'
        }
      },
      vAxis: {
        format: '$#,###',
        gridlines: {
          count: 10
        }
      },
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      }
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

  displayDropdownOptions: ListItem[] = [];
  appropriationDropdownOptions: ListItem[] = [];
  bablinDropdownOptions: ListItem[] = [];
  sagDropdownOptions: ListItem[] = [];
  wucdDropdownOptions: ListItem[] = [];
  expTypeDropdownOptions: ListItem[] = [];

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
    this.nonSummaryFundingLineRows.push(...this.summaryFundingLineRows);
    this.updateTotalFields(this.nonSummaryFundingLineGridApi, this.nonSummaryFundingLineRows);
    if (!this.nonSummaryFundingLineRows.length) {
      this.loadDataFromProgram();
    }
  }

  onSummaryGridReady(api: GridApi) {
    this.summaryFundingLineGridApi = api;
    this.summaryFundingLineRows = [...this.nonSummaryFundingLineRows];
    this.updateTotalFields(this.summaryFundingLineGridApi, this.summaryFundingLineRows);
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

    this.displayDropdownOptions = [
      {
        id: 'PR',
        name: 'PR',
        value: 'PR',
        rawData: 'PR',
        isSelected: true
      },
      {
        id: 'APPN',
        name: 'APPN',
        value: 'APPN',
        rawData: 'APPN',
        isSelected: false
      },
      {
        id: 'BA/BLIN',
        name: 'BA/BLIN',
        value: 'BA/BLIN',
        rawData: 'BA/BLIN',
        isSelected: false
      },
      {
        id: 'SAG',
        name: 'SAG',
        value: 'SAG',
        rawData: 'SAG',
        isSelected: false
      },
      {
        id: 'WUCD',
        name: 'WUCD',
        value: 'WUCD',
        rawData: 'WUCD',
        isSelected: false
      },
      {
        id: 'EXP Type',
        name: 'EXP Type',
        value: 'EXP Type',
        rawData: 'EXP Type',
        isSelected: false
      }
    ];
    this.insertDefaultOptions(this.appropriationDropdownOptions);
    this.insertDefaultOptions(this.bablinDropdownOptions);
    this.insertDefaultOptions(this.sagDropdownOptions);
    this.insertDefaultOptions(this.wucdDropdownOptions);
    this.insertDefaultOptions(this.expTypeDropdownOptions);
  }

  private loadDataFromProgram() {
    this.fundingLineService
      .obtainFundingLinesByProgramId(this.program.id)
      .pipe(map(resp => this.convertFundsToFiscalYear(resp)))
      .subscribe(resp => {
        const fundingLine = resp as FundingData[];
        this.nonSummaryFundingLineRows.push(...fundingLine);
        this.updateTotalFields(this.nonSummaryFundingLineGridApi, this.nonSummaryFundingLineRows);
        this.nonSummaryFundingLineGridApi.setRowData(this.nonSummaryFundingLineRows);
        this.drawLineChart();
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
    for (let i = this.pomYear - 3, x = 0; i < this.pomYear + 5; i++, x++) {
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
    for (let i = this.pomYear - 3, x = 0; i < this.pomYear + 5; i++, x++) {
      const headerName = (i < this.pomYear - 1
        ? 'PY' + (this.pomYear - i === 2 ? '' : this.pomYear - i - 2)
        : i >= this.pomYear
        ? 'BY' + (i === this.pomYear ? '' : i - this.pomYear)
        : 'CY'
      ).toLowerCase();
      fundingLineToSave.funds[i] = Number(fundingLine[headerName]);
    }
    fundingLineToSave.ctc = Number(fundingLine.ctc);
    return fundingLineToSave;
  }

  private setupSummaryFundingLineGrid() {
    const columnGroups: any[] = [];
    for (let i = this.pomYear - 3, x = 0; i < this.pomYear + 5; i++, x++) {
      const headerName =
        i < this.pomYear - 1
          ? 'PY' + (this.pomYear - i === 2 ? '' : '-' + (this.pomYear - i - 2))
          : i >= this.pomYear
          ? 'BY' + (i === this.pomYear ? '' : '+' + (i - this.pomYear))
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
            headerName: 'FY' + (i % 100),
            field: fieldPrefix,
            editable: i >= this.pomYear,
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
        field: 'appropriationSummary',
        cellRenderer: GroupCellRenderer,
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
    for (let i = this.pomYear - 3, x = 0; i < this.pomYear + 5; i++, x++) {
      const headerName =
        i < this.pomYear - 1
          ? 'PY' + (this.pomYear - i === 2 ? '' : '-' + (this.pomYear - i - 2))
          : i >= this.pomYear
          ? 'BY' + (i === this.pomYear ? '' : '+' + (i - this.pomYear))
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
            headerName: 'FY' + (i % 100),
            field: fieldPrefix,
            editable: i >= this.pomYear,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['numeric-class', 'regular-cell'],
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
            cellClass: params => ['text-class', 'regular-cell'],
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
            cellClass: params => ['text-class', 'regular-cell'],
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
            cellClass: params => ['text-class', 'regular-cell'],
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
            cellClass: params => ['text-class', 'regular-cell'],
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
            cellClass: params => ['text-class', 'regular-cell'],
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
        cellClass: params => ['numeric-class', 'regular-cell'],
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
        cellClass: params => ['numeric-class', 'regular-cell'],
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
        cellClass: params => 'regular-cell',
        cellRendererFramework: ActionCellRendererComponent,
        minWidth: 120
      }
    ];
    this.updateTotalFields(this.nonSummaryFundingLineGridApi, this.nonSummaryFundingLineRows);
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
          this.updateTotalFields(this.nonSummaryFundingLineGridApi, this.nonSummaryFundingLineRows);
          this.viewNonSummaryMode(rowIndex);
          this.reloadDropdownOptions();
          this.drawLineChart();
        },
        error => {
          this.dialogService.displayDebug(error);
          this.editRow(rowIndex);
        }
      );
  }

  private updateTotalFields(gridApi: GridApi, rows: FundingData[]) {
    const totalRow = {
      appropriationSummary: 'Total Funding',
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
    rows.forEach(row => {
      let total = 0;
      row.ctc = row.ctc ? row.ctc : 0;
      for (let i = this.pomYear - 3; i < this.pomYear + 5; i++) {
        const field =
          i < this.pomYear - 1
            ? 'py' + (this.pomYear - i === 2 ? '' : this.pomYear - i - 2)
            : i >= this.pomYear
            ? 'by' + (i === this.pomYear ? '' : i - this.pomYear)
            : 'cy';
        totalRow[field] += Number(row[field]);
        if (i >= this.pomYear) {
          total += Number(row[field]);
        }
      }
      row.fyTotal = total;
      totalRow.ctc += Number(row.ctc);
      totalRow.fyTotal += Number(row.fyTotal);
    });
    if (gridApi) {
      gridApi.setPinnedTopRowData([{ ...totalRow }]);
    }
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
          this.updateTotalFields(this.nonSummaryFundingLineGridApi, this.nonSummaryFundingLineRows);
          this.reloadDropdownOptions();
          this.drawLineChart();
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
            this.updateTotalFields(this.summaryFundingLineGridApi, this.summaryFundingLineRows);
            this.viewSummaryMode(rowIndex);
            this.reloadDropdownOptions();
            this.drawLineChart();
          },
          error => {
            this.dialogService.displayDebug(error);
            this.editSummaryRow(rowIndex, gridApiRowIndex);
          }
        );
    }
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
          this.updateTotalFields(this.summaryFundingLineGridApi, this.summaryFundingLineRows);
          this.summaryFundingLineGridApi.setRowData(this.summaryFundingLineRows);
          this.summaryFundingLineGridApi.refreshClientSideRowModel('aggregate');
          this.reloadDropdownOptions();
          this.drawLineChart();
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

  drawLineChart() {
    const data = this.lineChartData();
    this.chartData.dataTable = data;
    if (this.chart && this.chart.wrapper) {
      this.chart.draw();
    }
  }

  lineChartData() {
    let data: any[] = [['Fiscal Year']];
    let hasData: boolean;

    if (this.expTypeDropdown.visible) {
      if (this.expTypeDropdown.selectedItem.toLowerCase() !== 'select') {
        data = this.retrieveLineChartData(this.expTypeDropdown, this.expTypeDropdownOptions, 'expenditureType');
        hasData = true;
      }
    }
    if (this.wucdDropdown.visible && !hasData) {
      if (this.wucdDropdown.selectedItem.toLowerCase() !== 'select') {
        data = this.retrieveLineChartData(this.wucdDropdown, this.wucdDropdownOptions, 'wucd');
        hasData = true;
      }
    }
    if (this.sagDropdown.visible && !hasData) {
      if (this.sagDropdown.selectedItem.toLowerCase() !== 'select') {
        data = this.retrieveLineChartData(this.sagDropdown, this.sagDropdownOptions, 'sag');
        hasData = true;
      }
    }
    if (this.bablinDropdown.visible && !hasData) {
      if (this.bablinDropdown.selectedItem.toLowerCase() !== 'select') {
        data = this.retrieveLineChartData(this.bablinDropdown, this.bablinDropdownOptions, 'baOrBlin');
        hasData = true;
      }
    }
    if (this.appropriationDropdown.visible && !hasData) {
      if (this.appropriationDropdown.selectedItem.toLowerCase() !== 'select') {
        data = this.retrieveLineChartData(
          this.appropriationDropdown,
          this.appropriationDropdownOptions,
          'appropriation'
        );
        hasData = true;
      }
    }

    if (!hasData) {
      data = [['Fiscal Year', 'Total Funding']];
      const funds: number[] = [];
      const fundingLineRows = this.summaryFundingLineGridApi
        ? this.summaryFundingLineRows
        : this.nonSummaryFundingLineRows;
      fundingLineRows.forEach(row => {
        const fundingLine = this.convertFiscalYearToFunds(row);
        for (const year of Object.keys(fundingLine.funds)) {
          funds[year] = funds[year] ?? 0;
          funds[year] += Number(fundingLine.funds[year]) ?? 0;
        }
      });
      for (let i = this.pomYear - 3, x = 0; i < this.pomYear + 5; i++) {
        data.push(['FY' + (i % 100), funds[i] ?? 0]);
      }
    }

    return data;
  }

  private retrieveLineChartData(dropdown: DropdownComponent, downpdownOptions: ListItem[], field: string) {
    const data: any[] = [['Fiscal Year']];
    let funds: number[] = [];
    let fundingLineRows = this.summaryFundingLineGridApi ? this.summaryFundingLineRows : this.nonSummaryFundingLineRows;
    if (dropdown.selectedItem.toLowerCase() === 'all') {
      const current = [];
      downpdownOptions
        .filter((option, index) => index > 1)
        .forEach(option => {
          funds = [];
          const legends = this.retrieveChartLegend();
          data[0].push((legends.length ? legends + '/' : '') + option.name);
          const fundingLineFiltered = this.filterFundingLineRow();
          if (!this.isSingleChartDropdown()) {
            fundingLineRows = fundingLineFiltered;
          }
          fundingLineRows
            .filter(fundingLine => fundingLine[field] === option.name)
            .forEach(row => {
              const fundingLine = this.convertFiscalYearToFunds(row);
              for (const year of Object.keys(fundingLine.funds)) {
                funds[year] = funds[year] ?? 0;
                funds[year] += Number(fundingLine.funds[year]) ?? 0;
              }
            });
          current[option.name] = funds;
        });
      for (let i = this.pomYear - 3, x = 0; i < this.pomYear + 5; i++) {
        const singleData = ['FY' + (i % 100)];
        Object.keys(current).forEach(line => {
          singleData.push(current[line][i]);
        });
        data.push(singleData);
      }
    } else {
      data[0].push(this.retrieveChartLegend());
      const fundingLineFiltered = this.filterFundingLineRow();
      fundingLineFiltered.forEach(row => {
        const fundingLine = this.convertFiscalYearToFunds(row);
        for (const year of Object.keys(fundingLine.funds)) {
          funds[year] = funds[year] ?? 0;
          funds[year] += Number(fundingLine.funds[year]) ?? 0;
        }
      });
      for (let i = this.pomYear - 3, x = 0; i < this.pomYear + 5; i++) {
        data.push(['FY' + (i % 100), funds[i] ?? 0]);
      }
    }
    return data;
  }

  private filterFundingLineRow() {
    let filteredFundingLineRows = [];
    const dropdowns: any[] = [
      [this.appropriationDropdown, 'appropriation'],
      [this.bablinDropdown, 'baOrBlin'],
      [this.sagDropdown, 'sag'],
      [this.wucdDropdown, 'wucd'],
      [this.expTypeDropdown, 'expenditureType']
    ];
    const fundingLineRows = this.summaryFundingLineGridApi
      ? this.summaryFundingLineRows
      : this.nonSummaryFundingLineRows;

    dropdowns.forEach((dropdownData, index) => {
      const dropdown = dropdownData[0];
      const field = dropdownData[1];
      if (dropdown.visible) {
        const selection = dropdown.selectedItem.toLowerCase();
        if (selection !== 'select' && selection !== 'all') {
          filteredFundingLineRows = filteredFundingLineRows.length
            ? filteredFundingLineRows.filter(fundingLine => fundingLine[field] === dropdown.selectedItem)
            : fundingLineRows.filter(fundingLine => fundingLine[field] === dropdown.selectedItem);
        }
      }
    });
    return filteredFundingLineRows;
  }

  private isSingleChartDropdown() {
    const dropdowns = [
      this.appropriationDropdown,
      this.bablinDropdown,
      this.sagDropdown,
      this.wucdDropdown,
      this.expTypeDropdown
    ];
    return dropdowns.filter(dropdown => dropdown.visible).length === 1;
  }

  private retrieveChartLegend() {
    const dropdowns = [
      this.appropriationDropdown,
      this.bablinDropdown,
      this.sagDropdown,
      this.wucdDropdown,
      this.expTypeDropdown
    ];
    const legends = [];
    let legend: string;
    dropdowns.forEach(dropdown => {
      legend = this.retrieveDropdownValue(dropdown);
      if (legend) {
        legends.push(legend);
      }
    });
    return legends.join('/');
  }

  private retrieveDropdownValue(dropdown: DropdownComponent) {
    if (
      dropdown.visible &&
      dropdown.selectedItem.toLowerCase() !== 'select' &&
      dropdown.selectedItem.toLowerCase() !== 'all'
    ) {
      return dropdown.selectedItem;
    }
    return null;
  }

  onDisplayDropdownChange(event: ListItem) {
    this.clearOptions(this.appropriationDropdownOptions, this.appropriationDropdown);
    this.clearOptions(this.bablinDropdownOptions, this.bablinDropdown);
    this.clearOptions(this.sagDropdownOptions, this.sagDropdown);
    this.clearOptions(this.wucdDropdownOptions, this.wucdDropdown);
    this.clearOptions(this.expTypeDropdownOptions, this.expTypeDropdown);
    switch (event.name.toUpperCase()) {
      case 'APPN':
        this.loadChartDropdown(this.appropriationDropdownOptions, 'appropriation');
        break;
      case 'BA/BLIN':
        this.loadChartDropdown(this.bablinDropdownOptions, 'baOrBlin');
        break;
      case 'SAG':
        this.loadChartDropdown(this.sagDropdownOptions, 'sag');
        break;
      case 'WUCD':
        this.loadChartDropdown(this.wucdDropdownOptions, 'wucd');
        break;
      case 'EXP TYPE':
        this.loadChartDropdown(this.expTypeDropdownOptions, 'expenditureType');
        break;
    }
  }

  onAppropiationDropdownChange(event: ListItem) {
    this.clearOptions(this.bablinDropdownOptions, this.bablinDropdown);
    if (event.name.toLowerCase() !== 'all' && event.name.toLowerCase() !== 'select') {
      this.loadChartDropdown(this.bablinDropdownOptions, 'baOrBlin', 'appropriation', event.name);
      this.bablinDropdown.visible = true;
    }
    this.clearOptions(this.sagDropdownOptions, this.sagDropdown);
    this.clearOptions(this.wucdDropdownOptions, this.wucdDropdown);
    this.clearOptions(this.expTypeDropdownOptions, this.expTypeDropdown);
  }

  onBablinDropdownChange(event: ListItem) {
    this.clearOptions(this.sagDropdownOptions, this.sagDropdown);
    if (event.name.toLowerCase() !== 'all' && event.name.toLowerCase() !== 'select') {
      this.loadChartDropdown(this.sagDropdownOptions, 'sag', 'baOrBlin', event.name);
      if (this.sagDropdownOptions.length > 2) {
        this.sagDropdown.visible = true;
      }
    }
    this.clearOptions(this.wucdDropdownOptions, this.wucdDropdown);
    this.clearOptions(this.expTypeDropdownOptions, this.expTypeDropdown);
  }

  onSagDropdownChange(event: ListItem) {
    this.clearOptions(this.wucdDropdownOptions, this.wucdDropdown);
    if (event.name.toLowerCase() !== 'all' && event.name.toLowerCase() !== 'select') {
      this.loadChartDropdown(this.wucdDropdownOptions, 'wucd', 'sag', event.name);
      if (this.wucdDropdownOptions.length > 2) {
        this.wucdDropdown.visible = true;
      }
    }
    this.clearOptions(this.expTypeDropdownOptions, this.expTypeDropdown);
  }

  onWucdDropdownChange(event: ListItem) {
    this.clearOptions(this.expTypeDropdownOptions, this.expTypeDropdown);
    if (event.name.toLowerCase() !== 'all' && event.name.toLowerCase() !== 'select') {
      this.loadChartDropdown(this.expTypeDropdownOptions, 'expenditureType', 'wucd', event.name);
      if (this.expTypeDropdownOptions.length > 2) {
        this.expTypeDropdown.visible = true;
      }
    }
  }

  private loadChartDropdown(options: ListItem[], field: string, originField?: string, selectedOrigin?: string) {
    options.splice(0, options.length);
    this.insertDefaultOptions(options);
    const noFilter =
      (this.displayDropdown.selectedItem.toUpperCase() === 'APPN' && field === 'appropriation') ||
      (this.displayDropdown.selectedItem.toUpperCase() === 'BA/BLIN' && field === 'baOrBlin') ||
      (this.displayDropdown.selectedItem.toUpperCase() === 'SAG' && field === 'sag') ||
      (this.displayDropdown.selectedItem.toUpperCase() === 'WUCD' && field === 'wucd') ||
      (this.displayDropdown.selectedItem.toUpperCase() === 'EXP TYPE' && field === 'expenditureType');
    const filteredFundingRows = noFilter ? this.nonSummaryFundingLineRows : this.filterFundingLineRow();
    const dropdownOptions = [];
    if (filteredFundingRows.length) {
      dropdownOptions.push(
        ...filteredFundingRows.filter(fundingLine => fundingLine[field]).map(fundingLine => fundingLine[field])
      );
    } else {
      dropdownOptions.push(
        ...this.nonSummaryFundingLineRows
          .filter(fundingLine => (originField ? fundingLine[originField] === selectedOrigin : true))
          .filter(fundingLine => fundingLine[field])
          .map(fundingLine => fundingLine[field])
      );
    }
    new Set(dropdownOptions).forEach(option => {
      options.push({
        id: option,
        name: option,
        rawData: option,
        value: option,
        isSelected: false
      });
    });
  }

  private insertDefaultOptions(options: ListItem[], setSelected?: boolean) {
    options.push({
      id: 'Select',
      name: 'Select',
      rawData: 'Select',
      value: 'Select',
      isSelected: setSelected
    });
    options.push({
      id: 'All',
      name: 'All',
      rawData: 'All',
      value: 'All',
      isSelected: false
    });
  }

  private clearOptions(options: ListItem[], dropdown: DropdownComponent) {
    dropdown.selectedItem = 'Select';
    options.splice(0, options.length);
  }

  private reloadDropdownOptions() {
    let filterChain: FundingData[] = null;
    if (this.appropriationDropdown.visible) {
      filterChain = this.nonSummaryFundingLineRows.filter(
        fundingLine => fundingLine.appropriation === this.appropriationDropdown.selectedItem
      );
      const currentAppropriations = filterChain.map(fundingLine => fundingLine.appropriation);
      this.updateChartOptionDifferences(this.appropriationDropdownOptions, 'appropriation');
      const appropriationSelection = currentAppropriations.filter(
        option => option === this.appropriationDropdown.selectedItem
      )[0];
      if (!appropriationSelection && this.appropriationDropdown.selectedItem !== 'All') {
        this.bablinDropdown.selectedItem = 'Select';
        this.bablinDropdown.visible = false;
        this.appropriationDropdown.selectedItem = 'Select';
        this.sagDropdown.selectedItem = 'Select';
        this.sagDropdown.visible = false;
        this.wucdDropdown.selectedItem = 'Select';
        this.wucdDropdown.visible = false;
        this.expTypeDropdown.selectedItem = 'Select';
        this.expTypeDropdown.visible = false;
        this.loadChartDropdown(this.appropriationDropdownOptions, 'appropriation', null, null);
        return;
      }
    }

    if (this.bablinDropdown.visible) {
      filterChain = filterChain
        ? filterChain.filter(fundingLine => fundingLine.baOrBlin === this.bablinDropdown.selectedItem)
        : this.nonSummaryFundingLineRows.filter(
            fundingLine => fundingLine.baOrBlin === this.bablinDropdown.selectedItem
          );
      const currentBablins = filterChain.map(fundingLine => fundingLine.baOrBlin);
      this.updateChartOptionDifferences(this.bablinDropdownOptions, 'baOrBlin');
      const bablinSelection = currentBablins.filter(option => option === this.bablinDropdown.selectedItem)[0];
      if (!bablinSelection && this.bablinDropdown.selectedItem !== 'All') {
        this.bablinDropdown.selectedItem = 'Select';
        if (this.appropriationDropdown.selectedItem.toLowerCase() === 'select' && this.appropriationDropdown.visible) {
          this.bablinDropdown.visible = false;
        }
        this.sagDropdown.selectedItem = 'Select';
        this.sagDropdown.visible = false;
        this.wucdDropdown.selectedItem = 'Select';
        this.wucdDropdown.visible = false;
        this.expTypeDropdown.selectedItem = 'Select';
        this.expTypeDropdown.visible = false;
        this.loadChartDropdown(
          this.bablinDropdownOptions,
          'baOrBlin',
          'appropriation',
          this.appropriationDropdown.selectedItem
        );
        return;
      }
    }

    if (this.sagDropdown.visible) {
      filterChain = filterChain
        ? filterChain.filter(fundingLine => fundingLine.sag === this.sagDropdown.selectedItem)
        : this.nonSummaryFundingLineRows.filter(fundingLine => fundingLine.sag === this.sagDropdown.selectedItem);
      const currentSags = filterChain.map(fundingLine => fundingLine.sag);
      this.updateChartOptionDifferences(this.sagDropdownOptions, 'sag');
      const sagSelection = currentSags.filter(option => option === this.sagDropdown.selectedItem)[0];
      if (!sagSelection && this.sagDropdown.selectedItem !== 'All') {
        this.sagDropdown.selectedItem = 'Select';
        if (this.bablinDropdown.selectedItem.toLowerCase() === 'select' && this.bablinDropdown.visible) {
          this.sagDropdown.visible = false;
        }
        this.wucdDropdown.selectedItem = 'Select';
        this.wucdDropdown.visible = false;
        this.expTypeDropdown.selectedItem = 'Select';
        this.expTypeDropdown.visible = false;
        this.loadChartDropdown(this.sagDropdownOptions, 'sag', 'baOrBlin', this.bablinDropdown.selectedItem);
        return;
      }
    }

    if (this.wucdDropdown.visible) {
      filterChain = filterChain
        ? filterChain.filter(fundingLine => fundingLine.wucd === this.wucdDropdown.selectedItem)
        : this.nonSummaryFundingLineRows.filter(fundingLine => fundingLine.wucd === this.wucdDropdown.selectedItem);
      const currentWucds = filterChain.map(fundingLine => fundingLine.wucd);
      this.updateChartOptionDifferences(this.wucdDropdownOptions, 'wucd');
      const wucdSelection = currentWucds.filter(option => option === this.wucdDropdown.selectedItem)[0];
      if (!wucdSelection && this.wucdDropdown.selectedItem !== 'All') {
        this.wucdDropdown.selectedItem = 'Select';
        if (this.sagDropdown.selectedItem.toLowerCase() === 'select' && this.sagDropdown.visible) {
          this.wucdDropdown.visible = false;
        }
        this.expTypeDropdown.selectedItem = 'Select';
        this.expTypeDropdown.visible = false;
        this.loadChartDropdown(this.wucdDropdownOptions, 'wucd', 'sag', this.sagDropdown.selectedItem);
        return;
      }
    }

    if (this.expTypeDropdown.visible) {
      filterChain = filterChain
        ? filterChain.filter(fundingLine => fundingLine.expenditureType === this.expTypeDropdown.selectedItem)
        : this.nonSummaryFundingLineRows.filter(
            fundingLine => fundingLine.expenditureType === this.expTypeDropdown.selectedItem
          );
      const currentExpTypes = filterChain.map(fundingLine => fundingLine.expenditureType);
      this.updateChartOptionDifferences(this.expTypeDropdownOptions, 'expenditureType');
      const expTypeSelection = currentExpTypes.filter(option => option === this.expTypeDropdown.selectedItem)[0];
      if (!expTypeSelection && this.expTypeDropdown.selectedItem !== 'All') {
        this.expTypeDropdown.selectedItem = 'Select';
        if (this.wucdDropdown.selectedItem.toLowerCase() === 'select' && this.wucdDropdown.visible) {
          this.expTypeDropdown.visible = false;
          this.loadChartDropdown(
            this.expTypeDropdownOptions,
            'expenditureType',
            'wucd',
            this.wucdDropdown.selectedItem
          );
        }
      }
    }
  }

  private updateChartOptionDifferences(options: ListItem[], field: string) {
    const noFilter =
      (this.displayDropdown.selectedItem.toUpperCase() === 'APPN' && field === 'appropriation') ||
      (this.displayDropdown.selectedItem.toUpperCase() === 'BA/BLIN' && field === 'baOrBlin') ||
      (this.displayDropdown.selectedItem.toUpperCase() === 'SAG' && field === 'sag') ||
      (this.displayDropdown.selectedItem.toUpperCase() === 'WUCD' && field === 'wucd') ||
      (this.displayDropdown.selectedItem.toUpperCase() === 'EXP TYPE' && field === 'expenditureType');
    const filteredData = noFilter ? this.nonSummaryFundingLineRows : this.filterFundingLineRow();
    const differenceToRemove = options
      .filter((option, index) => index > 2)
      .map(option => option.name)
      .filter(option => !filteredData.map(fundingLine => fundingLine[field]).includes(option));
    const differenceToAdd = filteredData
      .map(fundingLine => fundingLine[field])
      .filter(fundingLine => !options.map(option => option.name).includes(fundingLine));
    differenceToRemove.forEach(option =>
      options.splice(
        options.findIndex(o => o.name === option),
        1
      )
    );
    differenceToAdd
      .filter(option => option)
      .forEach(option =>
        options.push({
          id: option,
          name: option,
          rawData: option,
          value: option,
          isSelected: false
        })
      );
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
