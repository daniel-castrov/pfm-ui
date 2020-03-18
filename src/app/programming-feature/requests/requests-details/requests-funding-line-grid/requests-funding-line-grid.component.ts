import { Component, OnInit, Input } from '@angular/core';
import { ColumnApi, GridApi, ColGroupDef, GroupCellRenderer } from '@ag-grid-community/all-modules';
import { DataGridMessage } from '../../../../pfm-coreui/models/DataGridMessage';
import { ActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { NumericCellEditor } from 'src/app/ag-grid/cell-editors/NumericCellEditor';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { Program } from 'src/app/programming-feature/models/Program';
import { ProgrammingService } from 'src/app/programming-feature/services/programming-service';
import { FundingLineService } from 'src/app/programming-feature/services/funding-line.service';
import { FundingData } from 'src/app/programming-feature/models/funding-data.model';
import { map } from 'rxjs/operators';
import { FundingLine } from 'src/app/programming-feature/models/funding-line.model';
import { Observable } from 'rxjs';

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
  baOptions = [];
  sagOptions = [];
  wucdOptions = [];
  expTypeOptions = [];

  constructor(
    private dialogService: DialogService,
    private fundingLineService: FundingLineService
  ) {
  }

  ngOnInit() {
    this.loadDropDownValues();
    this.setupSummaryFundingLineGrid();
    this.setupNonSummaryFundingLineGrid();
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
    if (!this.showSubtotals) {
      this.collapse();
    }
  }

  private loadDropDownValues() {
    this.appnOptions = [...new Set(this.program.fundingLines.map(fund => fund.appropriation).filter(fund => fund))];
    this.baOptions = [...new Set(this.program.fundingLines.map(fund => fund.baOrBlin).filter(fund => fund))];
    this.sagOptions = [...new Set(this.program.fundingLines.map(fund => fund.opAgency).filter(fund => fund))];
    this.wucdOptions = [...new Set(this.program.fundingLines.map(fund => fund.item).filter(fund => fund))];
    this.expTypeOptions = [...new Set(this.program.fundingLines.map(fund => fund.programElement).filter(fund => fund))];
  }

  private loadDataFromProgram() {
    this.fundingLineService.obtainFundingLinesByProgramId(this.program.id)
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
    for (let i = this.pomYear - 2, x = 0; i < this.pomYear + 6; i++, x++) {
      const headerName = (i < this.pomYear ?
        'PY' + (this.pomYear - i === 1 ? '' : (this.pomYear - i - 1)) :
        i > this.pomYear ? 'BY' + (i === this.pomYear + 1 ? '' : (i - this.pomYear - 1)) :
          'CY').toLowerCase();
      fundingData[headerName] = funds[i] ? funds[i] : 0;
    }
    fundingData.action = fundingLine.userCreated ? this.actionState.VIEW : null;
    return fundingData;
  }

  private convertFiscalYearToFunds(fundingLine: FundingData) {
    const fundingLineToSave: FundingLine = { ...fundingLine };
    fundingLineToSave.funds = {};
    for (let i = this.pomYear - 2, x = 0; i < this.pomYear + 6; i++, x++) {
      const headerName = (i < this.pomYear ?
        'PY' + (this.pomYear - i === 1 ? '' : (this.pomYear - i - 1)) :
        i > this.pomYear ? 'BY' + (i === this.pomYear + 1 ? '' : (i - this.pomYear - 1)) :
          'CY').toLowerCase();
      fundingLineToSave.funds[i] = Number(fundingLine[headerName]);
    }
    fundingLineToSave.ctc = Number(fundingLine.ctc);
    return fundingLineToSave;
  }

  private setupSummaryFundingLineGrid() {
    const columnGroups: any[] = [];
    for (let i = this.pomYear - 2, x = 0; i < this.pomYear + 6; i++, x++) {
      const headerName = i < this.pomYear ?
        'PY' + (this.pomYear - i === 1 ? '' : '-' + (this.pomYear - i - 1)) :
        i > this.pomYear ? 'BY' + (i === this.pomYear + 1 ? '' : '+' + (i - this.pomYear - 1)) :
          'CY';
      const fieldPrefix = headerName.toLowerCase().replace('+', '').replace('-', '');
      columnGroups.push({
        groupId: 'main-header',
        headerName,
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            colId: 5 + x,
            headerName: 'FY' + i % 100,
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
        if (this.currentNonSummaryRowDataState.isEditMode && !this.currentNonSummaryRowDataState.isAddMode) {
          this.cancelRow(cellAction.rowIndex);
        } else {
          this.deleteRow(cellAction.rowIndex);
        }
        break;
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
          if (this.currentSummaryRowDataState.isEditMode && !this.currentSummaryRowDataState.isAddMode) {
            this.cancelSummaryRow(rowIndex);
          }
          break;
      }
    }
  }

  onColumnIsReady(columnApi: ColumnApi) {
    this.columnApi = columnApi;
  }

  private setupNonSummaryFundingLineGrid() {
    const columnGroups: any[] = [];
    for (let i = this.pomYear - 2, x = 0; i < this.pomYear + 6; i++, x++) {
      const headerName = i < this.pomYear ?
        'PY' + (this.pomYear - i === 1 ? '' : '-' + (this.pomYear - i - 1)) :
        i > this.pomYear ? 'BY' + (i === this.pomYear + 1 ? '' : '+' + (i - this.pomYear - 1)) :
          'CY';
      const fieldPrefix = headerName.toLowerCase().replace('+', '').replace('-', '');
      columnGroups.push(
        {
          groupId: 'main-header',
          headerName,
          headerClass: this.headerClassFunc,
          marryChildren: true,
          children: [
            {
              colId: 4 + x,
              headerName: 'FY' + i % 100,
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
        }
      );
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
            editable: true,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', params.rowIndex === 0 ? 'aggregate-cell' : 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
              cellHeight: 100,
              values: [
                'Select',
                ...this.appnOptions
              ]
            }
          },
          {
            colId: 1,
            headerName: 'BA/BLIN',
            field: 'baOrBlin',
            editable: true,
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
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
              cellHeight: 100,
              values: [
                'Select',
                ...this.baOptions
              ]
            }
          },
          {
            colId: 2,
            headerName: 'SAG',
            field: 'sag',
            editable: true,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', params.rowIndex === 0 ? 'aggregate-cell' : 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
              cellHeight: 100,
              values: [
                'Select',
                ...this.sagOptions
              ]
            }
          },
          {
            colId: 3,
            headerName: 'WUCD',
            field: 'wucd',
            editable: true,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', params.rowIndex === 0 ? 'aggregate-cell' : 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
              cellHeight: 100,
              values: [
                'Select',
                ...this.wucdOptions
              ]
            }
          },
          {
            colId: 4,
            headerName: 'EXP Type',
            field: 'expenditureType',
            editable: true,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', params.rowIndex === 0 ? 'aggregate-cell' : 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
              cellHeight: 100,
              values: [
                'Select',
                ...this.expTypeOptions
              ]
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
        cellClass: params => params.rowIndex === 0 ? 'aggregate-cell' : 'regular-cell',
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
    return '$ ' + Number(params).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  onNonSummaryRowAdd(params) {
    if (this.currentNonSummaryRowDataState.isEditMode) {
      return;
    }
    this.nonSummaryFundingLineRows.push(
      {
        appropriation: '0',
        baOrBlin: '0',
        sag: '0',
        wucd: '0',
        expenditureType: '0',

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
      }
    );
    this.currentNonSummaryRowDataState.isAddMode = true;
    this.nonSummaryFundingLineGridApi.setRowData(this.nonSummaryFundingLineRows);
    this.editRow(this.nonSummaryFundingLineRows.length - 1);
  }

  private saveRow(rowIndex: number) {
    this.nonSummaryFundingLineGridApi.stopEditing();
    const row = this.nonSummaryFundingLineRows[rowIndex];
    const canSave = this.validateNonSummaryRowData(row);
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
    this.nonSummaryFundingLineRows.filter((row, index) => index > 0)
      .forEach(row => {
        let total = 0;
        row.ctc = row.ctc ? row.ctc : 0;
        for (let i = this.pomYear - 2; i < this.pomYear + 6; i++) {
          const field = i < this.pomYear ?
            'py' + (this.pomYear - i === 1 ? '' : this.pomYear - i - 1) :
            i > this.pomYear ? 'by' + (i === this.pomYear + 1 ? '' : i - this.pomYear - 1) :
              'cy';
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

  private validateNonSummaryRowData(row: any) {
    let errorMessage = '';
    if (!row.appropriation.length || row.appropriation.toLowerCase() === 'select') {
      errorMessage = 'Please, select an APPN.';
    } else if (!row.baOrBlin.length || row.baOrBlin.toLowerCase() === 'select') {
      errorMessage = 'Please, select a BA/BLIN.';
    } else if (!row.sag.length || row.sag.toLowerCase() === 'select') {
      errorMessage = 'Please, select a SAG.';
    } else if (!row.wucd.length || row.wucd.toLowerCase() === 'select') {
      errorMessage = 'Please, select a WUCD.';
    } else if (!row.expenditureType.length || row.expenditureType.toLowerCase() === 'select') {
      errorMessage = 'Please, select a Exp Type.';
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
  }

  private deleteRow(rowIndex: number) {
    if (this.nonSummaryFundingLineRows[rowIndex].id) {
      this.fundingLineService.removeFundingLineById(this.nonSummaryFundingLineRows[rowIndex].id)
        .subscribe(
          () => {
            this.performNonSummaryDelete(rowIndex);
            this.updateTotalFields();
          },
          error => {
            this.dialogService.displayDebug(error);
          });
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
    this.nonSummaryFundingLineRows[rowIndex].action = this.actionState.VIEW;
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
      this.fundingLineService.updateFundingLine(fundingLine)
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
    this.summaryFundingLineRows
      .forEach(row => {
        let total = 0;
        for (let i = this.pomYear + 1; i < this.pomYear + 6; i++) {
          const field = i < this.pomYear ?
            'py' + (this.pomYear - i === 1 ? '' : this.pomYear - i - 1) :
            i > this.pomYear ? 'by' + (i === this.pomYear + 1 ? '' : i - this.pomYear - 1) :
              'cy';
          if (i > this.pomYear) {
            row[field] = Number(row[field]);
          }
          total += Number(row[field]);
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
      this.fundingLineService.removeFundingLineById(this.summaryFundingLineRows[rowIndex].id)
        .subscribe(
          () => {
            this.summaryFundingLineRows.splice(rowIndex, 1);
            this.updateSummaryTotalFields();
            this.summaryFundingLineGridApi.setRowData(this.summaryFundingLineRows);
            this.summaryFundingLineGridApi.refreshClientSideRowModel('aggregate');
          },
          error => {
            this.dialogService.displayDebug(error);
          });
    }
  }

  private viewSummaryMode(rowIndex: number) {
    this.currentSummaryRowDataState.currentEditingRowIndex = 0;
    this.currentSummaryRowDataState.isEditMode = false;
    this.currentSummaryRowDataState.isAddMode = false;
    this.summaryFundingLineGridApi.stopEditing();
    this.summaryFundingLineRows[rowIndex].action = this.actionState.VIEW;
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
