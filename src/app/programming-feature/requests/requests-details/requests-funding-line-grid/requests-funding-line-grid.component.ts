import { Component, OnInit, Input } from '@angular/core';
import { ColumnApi, GridApi, ColGroupDef, GroupCellRenderer } from '@ag-grid-community/all-modules';
import { DataGridMessage } from '../../../../pfm-coreui/models/DataGridMessage';
import { ActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { NumericCellEditor } from 'src/app/ag-grid/cell-editors/NumericCellEditor';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';

@Component({
  selector: 'pfm-requests-funding-line-grid',
  templateUrl: './requests-funding-line-grid.component.html',
  styleUrls: ['./requests-funding-line-grid.component.scss']
})
export class RequestsFundingLineGridComponent implements OnInit {

  @Input() pomYear: number;

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
  nonSummaryFundingLineRows: any[] = [];
  nonSummaryFundingLineColumnsDefinition: ColGroupDef[];

  currentNonSummaryRowDataState: RowDataStateInterface = {};
  currentSummaryRowDataState: RowDataStateInterface = {};
  deleteDialog: DeleteDialogInterface = { title: 'Delete' };

  constructor(
    private dialogService: DialogService
  ) {
  }

  ngOnInit() {
    this.setupSummaryFundingLineGrid();
    this.setupNonSummaryFundingLineGrid();
  }

  onToggleValueChanged(value) {
    this.showSubtotals = value;
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
        showRowGroup: 'appn',
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
        showRowGroup: 'ba',
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
        field: 'expType',
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
        field: 'appn',
        rowGroup: true,
        hide: true
      },
      {
        field: 'ba',
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
          this.saveSummaryRow(rowIndex);
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

  onSummaryGridReady(api: GridApi) {
    this.summaryFundingLineGridApi = api;
    this.summaryFundingLineRows = [...this.nonSummaryFundingLineRows.filter((x, index) => index > 0)];
    this.updateSummaryTotalFields();
    this.summaryFundingLineGridApi.setRowData(this.summaryFundingLineRows);
  }

  onColumnIsReady(columnApi: ColumnApi) {
    this.columnApi = columnApi;
  }

  onNonSummaryGridIsReady(api: GridApi) {
    this.nonSummaryFundingLineGridApi = api;
    this.nonSummaryFundingLineRows = [];
    this.resetTotalFunding();
    this.nonSummaryFundingLineRows.splice(1, 0, ...this.summaryFundingLineRows);
    this.updateTotalFields();
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
            field: 'appn',
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
                'O&M',
                'MILCON',
                'JIDF'
              ]
            },
          },
          {
            colId: 1,
            headerName: 'BA/BLIN',
            field: 'ba',
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
                'BA1',
                'BA2',
                'BA3',
                'BA4',
                'BA5',
                'BA6'
              ]
            },
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
                'AA',
                'x',
                'y',
                'z'
              ]
            },
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
                'COMSC',
                'ALTRL',
                'xxxx',
                'JACW',
                'zzzz'
              ]
            },
          },
          {
            colId: 4,
            headerName: 'EXP Type',
            field: 'expType',
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
                '252.3',
                '21.5',
                'xxx',
                '111.1',
                '222.2'
              ]
            },
          },
        ],
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
      appn: 'Total Funding',

      py1: 0,
      py: 0,
      cy: 0,
      by: 0,
      by1: 0,
      by2: 0,
      by3: 0,
      by4: 0,
      by5: 0,

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
        appn: 0,
        ba: 0,
        sag: 0,
        wucd: 0,
        expType: 0,

        py1: 0,
        py: 0,
        cy: 0,
        by: 0,
        by1: 0,
        by2: 0,
        by3: 0,
        by4: 0,
        by5: 0,

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
      this.updateTotalFields();
      this.viewNonSummaryMode(rowIndex);
    } else {
      this.editRow(rowIndex);
    }
  }

  private updateTotalFields() {
    this.resetTotalFunding();
    this.nonSummaryFundingLineRows.filter((row, index) => index > 0)
      .forEach(row => {
        let total = 0;
        for (let i = this.pomYear + 1; i < this.pomYear + 6; i++) {
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
    if (!row.appn.length || row.appn.toLowerCase() === 'select') {
      errorMessage = 'Please, select an APPN.';
    } else if (!row.ba.length || row.ba.toLowerCase() === 'select') {
      errorMessage = 'Please, select a BA/BLIN.';
    } else if (!row.sag.length || row.sag.toLowerCase() === 'select') {
      errorMessage = 'Please, select a SAG.';
    } else if (!row.wucd.length || row.wucd.toLowerCase() === 'select') {
      errorMessage = 'Please, select a WUCD.';
    } else if (!row.expType.length || row.expType.toLowerCase() === 'select') {
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
    this.nonSummaryFundingLineRows.splice(rowIndex, 1);
    this.nonSummaryFundingLineRows.forEach(row => {
      row.order--;
    });
    this.currentNonSummaryRowDataState.currentEditingRowIndex = 0;
    this.currentNonSummaryRowDataState.isEditMode = false;
    this.currentNonSummaryRowDataState.isAddMode = false;
    this.nonSummaryFundingLineGridApi.stopEditing();
    this.nonSummaryFundingLineRows.forEach(row => {
      row.isDisabled = false;
    });
    this.updateTotalFields();
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

  private saveSummaryRow(rowIndex: number) {
    this.summaryFundingLineGridApi.stopEditing();
    this.updateSummaryTotalFields();
    this.viewSummaryMode(rowIndex);
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
    this.summaryFundingLineRows.splice(rowIndex, 1);
    this.summaryFundingLineRows.forEach(row => {
      row.order--;
    });
    this.currentSummaryRowDataState.currentEditingRowIndex = 0;
    this.currentSummaryRowDataState.isEditMode = false;
    this.currentSummaryRowDataState.isAddMode = false;
    this.summaryFundingLineGridApi.stopEditing();
    this.summaryFundingLineRows.forEach(row => {
      row.isDisabled = false;
    });
    this.updateSummaryTotalFields();
    this.summaryFundingLineGridApi.setRowData(this.summaryFundingLineRows);
    this.summaryFundingLineGridApi.refreshClientSideRowModel('aggregate');
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
