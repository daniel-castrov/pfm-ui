import { Component, OnInit, Input } from '@angular/core';
import { GridApi, ColGroupDef } from '@ag-grid-community/all-modules';
import { ActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { of } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { NumericCellEditor } from 'src/app/ag-grid/cell-editors/NumericCellEditor';

@Component({
  selector: 'pfm-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit {

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

  form: FormGroup;
  showFundingLineGrid: boolean;
  toBeUsedByOptions: string[];

  fundingLineOptions: any[] = [];

  fundingLineGridApi: GridApi;
  fundingLineColumnsDefinition: ColGroupDef[];
  fundingLineRows: any[] = [];

  currentRowDataState: RowDataStateInterface = {};

  constructor(
    private formBuilder: FormBuilder,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    if (!this.pomYear) {
      return;
    }
    this.loadFundingLines();
    this.loadToBeUsedBy();
    this.setupFundingLineGrid();
  }

  loadFundingLines() {
    this.form = this.formBuilder.group({
      fundingLineSelect: ['']
    });

    of(this.getFundingLineOptions()).subscribe(fundingLine => {
      this.fundingLineOptions = fundingLine;
      this.form.controls.fundingLineSelect.patchValue(0);
    });
  }

  loadToBeUsedBy() {
    this.toBeUsedByOptions = [
        'Select',
        'USA',
        'USN',
        'USAF',
        'USMC',
        'USNG',
        'CBDP'
    ];
  }

  onChangeSuit(event: any) {
    this.form.get('fundingLineSelect').setValue(event.target.value, {
      onlySelf: true
    });
    this.showFundingLineGrid = this.form.get('fundingLineSelect').value[1];
  }

  getFundingLineOptions() {
    // Server Call
    return [
      'O&M/BA4/x/COMSC/252.3',
      'O&M/BA6/x/ALTRL/21/5',
      'O&M/BA5/y/XXXX/XXX',
      'MILCON/BA4/AA/JACW/111.1',
      'JIDF/BA1/z/zzzz/222.2'
    ];
  }

  onGridIsReady(fundingLineGridApi: GridApi) {
    this.fundingLineGridApi = fundingLineGridApi;
    this.fundingLineGridApi.setHeaderHeight(50);
    this.fundingLineGridApi.setGroupHeaderHeight(25);
  }

  onRowAdd(event: any) {
    if (this.currentRowDataState.isEditMode) {
      return;
    }
    this.fundingLineRows.push(
      {
        assetDescription: '',
        contractorManufacturer: '',
        toBeUsedBy: '',

        py1UnitCost: 0,
        py1Quantity: 0,
        py1TotalCost: 0,
        pyUnitCost: 0,
        pyQuantity: 0,
        pyTotalCost: 0,
        cyUnitCost: 0,
        cyQuantity: 0,
        cyTotalCost: 0,
        byUnitCost: 0,
        byQuantity: 0,
        byTotalCost: 0,
        by1UnitCost: 0,
        by1Quantity: 0,
        by1TotalCost: 0,
        by2UnitCost: 0,
        by2Quantity: 0,
        by2TotalCost: 0,
        by3UnitCost: 0,
        by3Quantity: 0,
        by3TotalCost: 0,
        by4UnitCost: 0,
        by4Quantity: 0,
        by4TotalCost: 0,

        action: this.actionState.EDIT
      }
    );
    this.currentRowDataState.isAddMode = true;
    this.fundingLineGridApi.setRowData(this.fundingLineRows);
    this.editRow(this.fundingLineRows.length - 1);
  }

  onCellAction(cellAction: DataGridMessage) {
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
          this.deleteRow(cellAction.rowIndex);
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

  private saveRow(rowIndex: number) {
    this.fundingLineGridApi.stopEditing();
    const row = this.fundingLineRows[rowIndex];
    const canSave = this.validateRowData(row);
    if (canSave) {
      this.viewMode(rowIndex);
    } else {
      this.editRow(rowIndex);
    }
  }

  private validateRowData(row: any) {
    let errorMessage = '';
    if (!row.assetDescription.length) {
      errorMessage = 'Asset Description cannot be empty.';
    } else if (row.assetDescription.length > 45) {
      errorMessage = 'Asset Description cannot have more than 45 characters.';
    } else if (row.contractorManufacturer.toLowerCase() === 'select') {
      errorMessage = 'Please, select a Contractor / Manufacturer.';
    } else if (row.toBeUsedBy.toLowerCase() === 'select') {
      errorMessage = 'Please, select a To be Used By.';
    }
    if (errorMessage.length) {
      this.dialogService.displayError(errorMessage);
    }
    return !errorMessage.length;
  }

  private cancelRow(rowIndex: number) {
    this.fundingLineRows[rowIndex] = this.currentRowDataState.currentEditingRowData;
    this.viewMode(rowIndex);
  }

  private editRow(rowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.currentRowDataState.currentEditingRowData = { ...this.fundingLineRows[rowIndex] };
    }
    this.editMode(rowIndex);
  }

  private deleteRow(rowIndex: number) {
    this.fundingLineRows.splice(rowIndex, 1);
    this.fundingLineRows.forEach(row => {
      row.order--;
    });
    this.currentRowDataState.currentEditingRowIndex = 0;
    this.currentRowDataState.isEditMode = false;
    this.currentRowDataState.isAddMode = false;
    this.fundingLineGridApi.stopEditing();
    this.fundingLineRows.forEach(row => {
      row.isDisabled = false;
    });
    this.fundingLineGridApi.setRowData(this.fundingLineRows);
  }

  private viewMode(rowIndex: number) {
    this.currentRowDataState.currentEditingRowIndex = 0;
    this.currentRowDataState.isEditMode = false;
    this.currentRowDataState.isAddMode = false;
    this.fundingLineGridApi.stopEditing();
    this.fundingLineRows[rowIndex].action = this.actionState.VIEW;
    this.fundingLineRows.forEach(row => {
      row.isDisabled = false;
    });
    this.fundingLineGridApi.setRowData(this.fundingLineRows);
  }

  private editMode(rowIndex: number) {
    this.currentRowDataState.currentEditingRowIndex = rowIndex;
    this.currentRowDataState.isEditMode = true;
    this.fundingLineRows[rowIndex].action = this.actionState.EDIT;
    this.fundingLineRows.forEach((row, index) => {
      if (rowIndex !== index) {
        row.isDisabled = true;
      }
    });
    this.fundingLineGridApi.setRowData(this.fundingLineRows);
    this.fundingLineGridApi.startEditingCell({
      rowIndex,
      colKey: 'assetDescription'
    });
  }

  onMouseDown(mouseEvent: MouseEvent) {
    if (this.currentRowDataState.isEditMode) {
      this.fundingLineGridApi.startEditingCell({
        rowIndex: this.currentRowDataState.currentEditingRowIndex,
        colKey: 'assetDescription'
      });
    }
  }

  setupFundingLineGrid() {
    const columnGroups: any[] = [];
    for (let i = this.pomYear - 2; i < this.pomYear + 6; i++) {
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
              groupId: 'sub-header',
              headerClass: this.headerClassFunc,
              headerName: 'FY' + i,
              children: [
                {
                  headerName: 'Unit Cost',
                  field: fieldPrefix + 'UnitCost',
                  editable: i > this.pomYear,
                  suppressMovable: true,
                  filter: false,
                  sortable: false,
                  cellClass: 'numeric-class',
                  cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
                  minWidth: 45,
                  maxWidth: 45,
                  cellEditor: NumericCellEditor.create({ returnUndefinedOnZero: false })
                },
                {
                  headerName: 'Qty',
                  field: fieldPrefix + 'Quantity',
                  editable: i > this.pomYear,
                  suppressMovable: true,
                  filter: false,
                  sortable: false,
                  cellClass: 'numeric-class',
                  cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
                  minWidth: 45,
                  maxWidth: 45,
                  cellEditor: NumericCellEditor.create({ returnUndefinedOnZero: false })
                },
                {
                  headerName: 'Total Cost',
                  field: fieldPrefix + 'TotalCost',
                  editable: i > this.pomYear,
                  suppressMovable: true,
                  filter: false,
                  sortable: false,
                  cellClass: 'numeric-class',
                  cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
                  minWidth: 45,
                  maxWidth: 45,
                  cellEditor: NumericCellEditor.create({ returnUndefinedOnZero: false })
                }
              ]
            }
          ]
        }
      );
    }
    this.fundingLineColumnsDefinition = [
      {
        groupId: 'main-header',
        headerName: 'Unit Costs in $K Total Costs in $M',
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            headerName: 'Asset Description',
            field: 'assetDescription',
            editable: true,
            suppressMovable: true,
            filter: false,
            sortable: false,
            cellClass: 'text-class',
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
            maxWidth: 120,
            minWidth: 120
          },
          {
            headerName: 'Contractor / Manufacturer',
            field: 'contractorManufacturer',
            editable: true,
            suppressMovable: true,
            filter: false,
            sortable: false,
            cellClass: 'text-class',
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
            maxWidth: 120,
            minWidth: 120,
            cellEditor: 'select',
            cellEditorParams: {
              cellHeight: 100,
              values: this.toBeUsedByOptions
            },
          },
          {
            headerName: 'To be Used By',
            field: 'toBeUsedBy',
            editable: true,
            suppressMovable: true,
            filter: false,
            sortable: false,
            cellClass: 'text-class',
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
            maxWidth: 120,
            minWidth: 120,
            cellEditor: 'select',
            cellEditorParams: {
              cellHeight: 100,
              values: this.toBeUsedByOptions
            },
          },
        ],
      },
      ...columnGroups,
      {
        groupId: 'main-header',
        headerName: '',
        headerClass: this.headerClassFunc,
        children: [
          {
            headerName: 'Actions',
            field: 'action',
            editable: false,
            suppressMovable: true,
            filter: false,
            sortable: false,
            cellRendererFramework: ActionCellRendererComponent,
            minWidth: 75
          }
        ]
      }
    ];
  }

  currencyFormatter(params) {
    return '$ ' + Math.floor(params).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  headerClassFunc(params: any) {
    let isSubHeader = false;
    let isMainHeader = false;
    let column = params.column ? params.column : params.columnGroup;
    while (column) {
      if (column.getDefinition().groupId === 'main-header') {
        isMainHeader = true;
      } else if (column.getDefinition().groupId === 'sub-header') {
        isSubHeader = true;
      }
      column = column.getParent();
    }
    if (isSubHeader) {
      return 'sub-header';
    } else if (isMainHeader) {
      return 'main-header';
    } else {
      return null;
    }
  }

}

export interface RowDataStateInterface {

  currentEditingRowIndex?: number;
  isAddMode?: boolean;
  isEditMode?: boolean;
  currentEditingRowData?: any;

}
