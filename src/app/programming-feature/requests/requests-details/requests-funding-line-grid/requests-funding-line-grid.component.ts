import { Component, OnInit, Input } from '@angular/core';
import { ColumnApi, GridApi, ColGroupDef } from '@ag-grid-community/all-modules';
import { DataGridMessage } from '../../../../pfm-coreui/models/DataGridMessage';
import { FundingData } from '../../../models/FundingData';
import { TreeCellRendererComponent } from '../../../../pfm-coreui/datagrid/renderers/tree-cell-renderer/tree-cell-renderer.component';
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

  fundingData: FundingData[];
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnsToGroup: any[];
  columnsToSum: any[];

  id = 'requests-funding-line-grid-component';
  busy: boolean;

  nonSummaryFundingLineGridApi: GridApi;
  nonSummaryFundingLineRows: any[] = [];
  nonSummaryFundingLineColumnsDefinition: ColGroupDef[];

  currentRowDataState: RowDataStateInterface = {};
  deleteDialog: DeleteDialogInterface = { title: 'Delete' };

  constructor(
    private dialogService: DialogService
  ) {
  }

  ngOnInit() {
    this.setupSummartFundingLineGrid();
    this.setupNonSummaryFundingLineGrid();
  }

  onToggleValueChanged(value) {
    this.showSubtotals = value;
  }

  private setupSummartFundingLineGrid() {
    this.columnsToGroup = [
      {
        headerName: 'APPN',
        field: 'appropriation',
        editable: false,
        cellClass: 'pfm-datagrid-text pfm-datagrid-text-underline pfm-datagrid-lightgreybg',
        cellRendererFramework: TreeCellRendererComponent
      },
      {
        headerName: 'BA/BLIN',
        field: 'baOrBlin',
        editable: false,
        cellClass: 'pfm-datagrid-text pfm-datagrid-lightgreybg',
        cellRendererFramework: TreeCellRendererComponent
      },
      {
        headerName: 'SAG',
        field: 'sag',
        editable: false,
        cellClass: 'pfm-datagrid-text pfm-datagrid-lightgreybg',
        cellRendererFramework: TreeCellRendererComponent
      },
      {
        headerName: 'WUCD',
        field: 'wucd',
        editable: false,
        cellClass: 'pfm-datagrid-text pfm-datagrid-lightgreybg',
        cellRendererFramework: TreeCellRendererComponent
      }];

    this.columnsToSum = [
      {
        headerName: 'FY18',
        field: 'fy18',
        editable: false,
        cellClass: 'pfm-datagrid-numeric-class pfm-datagrid-lightgreybg',
      },
      {
        headerName: 'FY19',
        field: 'fy19',
        editable: false,
        cellClass: 'pfm-datagrid-numeric-class pfm-datagrid-lightgreybg',
      },
      {
        headerName: 'FY20',
        field: 'fy20',
        editable: false,
        cellClass: 'pfm-datagrid-numeric-class pfm-datagrid-lightgreybg',
      }
      ,
      {
        headerName: 'FY21',
        field: 'fy21',
        editable: false,
        cellClass: 'pfm-datagrid-numeric-class pfm-datagrid-lightgreybg',
      }
      ,
      {
        headerName: 'FY22',
        field: 'fy22',
        editable: false,
        cellClass: 'pfm-datagrid-numeric-class pfm-datagrid-lightgreybg',
      }
      ,
      {
        headerName: 'FY23',
        field: 'fy23',
        editable: false,
        cellClass: 'pfm-datagrid-numeric-class pfm-datagrid-lightgreybg',
      }
      ,
      {
        headerName: 'FY24',
        field: 'fy24',
        editable: false,
        cellClass: 'pfm-datagrid-numeric-class pfm-datagrid-lightgreybg',
      }
      ,
      {
        headerName: 'FY25',
        field: 'fy25',
        editable: false,
        cellClass: 'pfm-datagrid-numeric-class pfm-datagrid-lightgreybg',
      }
      ,
      {
        headerName: 'FYTotal',
        field: 'fyTotal',
        editable: false,
        cellClass: 'pfm-datagrid-numeric-class pfm-datagrid-lightgreybg',
      }
    ];

    this.createMockData();
  }

  onNonSummaryCellAction(cellAction: DataGridMessage) {
    switch (cellAction.message) {
      case 'save':
        this.saveRow(cellAction.rowIndex);
        break;
      case 'edit':
        if (!this.currentRowDataState.isEditMode) {
          this.editRow(cellAction.rowIndex, true);
        }
        break;
      case 'delete-row':
        if (!this.currentRowDataState.isEditMode) {
          this.deleteDialog.bodyText =
            'You will be permanently deleting the row from the grid.  Are you sure you want to delete this row?';
          this.displayDeleteDialog(cellAction, this.deleteRow.bind(this));
        }
        break;
      case 'cancel':
        if (this.currentRowDataState.isEditMode && !this.currentRowDataState.isAddMode) {
          this.cancelRow(cellAction.rowIndex);
        } else {
          this.deleteRow(cellAction.rowIndex);
        }
        break;
    }
  }

  onGridIsReady(gridApi: GridApi) {
    this.gridApi = gridApi;
  }

  onColumnIsReady(columnApi: ColumnApi) {
    this.columnApi = columnApi;
  }

  private createMockData() {
    this.fundingData = [];
    this.fundingData.push(this.makeData('1', 'O&M', 'BA4', 'x', 'radio'));
    this.fundingData.push(this.makeData('2', 'O&M', 'BA4', 'x', 'radio'));
    this.fundingData.push(this.makeData('3', 'O&M', 'BA5', 'x', 'radio'));

    this.fundingData.push(this.makeData('7', 'MILCON', 'BA1', 'AA', 'radio'));
    this.fundingData.push(this.makeData('8', 'MILCON', 'BA1', 'AB', 'radio'));
  }

  private makeData(id: string, appropriation: string, baOrBlin: string, sag: string, wucd: string) {
    const data: FundingData = new FundingData();
    data.id = id;
    data.appropriation = appropriation;
    data.baOrBlin = baOrBlin;
    data.sag = sag;
    data.wucd = wucd;
    data.fy18 = 1;
    data.fy19 = 1;
    data.fy20 = 1;
    data.fy21 = 1;
    data.fy22 = 1;
    data.fy23 = 1;
    data.fy24 = 1;
    data.fy25 = 1;
    data.fyTotal = 1;
    return data;
  }

  onNonSummaryGridIsReady(api: GridApi) {
    this.nonSummaryFundingLineGridApi = api;
    this.nonSummaryFundingLineGridApi.setHeaderHeight(50);
    this.nonSummaryFundingLineGridApi.setGroupHeaderHeight(25);
  }

  private setupNonSummaryFundingLineGrid() {
    const columnGroups: any[] = [];
    for (let i = this.pomYear - 2, x = 0; i < this.pomYear + 6; i++ , x++) {
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
            maxWidth: 120,
            minWidth: 120,
            cellEditor: 'select',
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
            maxWidth: 120,
            minWidth: 120,
            cellEditor: 'select',
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
            maxWidth: 120,
            minWidth: 120,
            cellEditor: 'select',
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
            maxWidth: 120,
            minWidth: 120,
            cellEditor: 'select',
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
            maxWidth: 120,
            minWidth: 120,
            cellEditor: 'select',
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
        valueFormatter: params =>
          params.node.rowIndex === 0 ? '' : this.currencyFormatter(params.data[params.colDef.field])
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
        minWidth: 90
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

      action: null
    };
  }

  currencyFormatter(params) {
    return '$ ' + Number(params).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  onNonSummaryRowAdd(params) {
    if (this.currentRowDataState.isEditMode) {
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
    this.currentRowDataState.isAddMode = true;
    this.nonSummaryFundingLineGridApi.setRowData(this.nonSummaryFundingLineRows);
    this.editRow(this.nonSummaryFundingLineRows.length - 1);
  }

  private saveRow(rowIndex: number) {
    this.nonSummaryFundingLineGridApi.stopEditing();
    const row = this.nonSummaryFundingLineRows[rowIndex];
    const canSave = this.validateRowData(row);
    if (canSave) {
      this.updateTotalFields();
      this.viewMode(rowIndex);
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
        this.nonSummaryFundingLineRows[0].fyTotal += Number(row.fyTotal);
      });
  }

  private validateRowData(row: any) {
    let errorMessage = '';
    if (!row.appn.length || row.appn.toLowerCase() === 'select') {
      errorMessage = 'Please, select an APPN.';
    } else if (!row.ba.length || row.appn.toLowerCase() === 'select') {
      errorMessage = 'Please, select a BA/BLIN.';
    } else if (!row.sag.length || row.appn.toLowerCase() === 'select') {
      errorMessage = 'Please, select a SAG.';
    } else if (!row.wucd.length || row.appn.toLowerCase() === 'select') {
      errorMessage = 'Please, select a WUCD.';
    } else if (!row.expType.length || row.appn.toLowerCase() === 'select') {
      errorMessage = 'Please, select a Exp Type.';
    }
    if (errorMessage.length) {
      this.dialogService.displayError(errorMessage);
    }
    return !errorMessage.length;
  }

  private cancelRow(rowIndex: number) {
    this.nonSummaryFundingLineRows[rowIndex] = this.currentRowDataState.currentEditingRowData;
    this.viewMode(rowIndex);
  }

  private editRow(rowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.currentRowDataState.currentEditingRowData = { ...this.nonSummaryFundingLineRows[rowIndex] };
    }
    this.editMode(rowIndex);
  }

  private deleteRow(rowIndex: number) {
    this.nonSummaryFundingLineRows.splice(rowIndex, 1);
    this.nonSummaryFundingLineRows.forEach(row => {
      row.order--;
    });
    this.currentRowDataState.currentEditingRowIndex = 0;
    this.currentRowDataState.isEditMode = false;
    this.currentRowDataState.isAddMode = false;
    this.nonSummaryFundingLineGridApi.stopEditing();
    this.nonSummaryFundingLineRows.forEach(row => {
      row.isDisabled = false;
    });
    this.updateTotalFields();
    this.nonSummaryFundingLineGridApi.setRowData(this.nonSummaryFundingLineRows);
  }

  private viewMode(rowIndex: number) {
    this.currentRowDataState.currentEditingRowIndex = 0;
    this.currentRowDataState.isEditMode = false;
    this.currentRowDataState.isAddMode = false;
    this.nonSummaryFundingLineGridApi.stopEditing();
    this.nonSummaryFundingLineRows[rowIndex].action = this.actionState.VIEW;
    this.nonSummaryFundingLineRows.forEach(row => {
      row.isDisabled = false;
    });
    this.nonSummaryFundingLineGridApi.setRowData(this.nonSummaryFundingLineRows);
  }

  private editMode(rowIndex: number) {
    this.currentRowDataState.currentEditingRowIndex = rowIndex;
    this.currentRowDataState.isEditMode = true;
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

  onMouseDown(mouseEvent: MouseEvent) {
    if (this.currentRowDataState.isEditMode) {
      this.nonSummaryFundingLineGridApi.startEditingCell({
        rowIndex: this.currentRowDataState.currentEditingRowIndex,
        colKey: '0'
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
