import { Component, OnInit, Input } from '@angular/core';
import { GridApi, ColGroupDef, ColumnApi, CellPosition } from '@ag-grid-community/all-modules';
import { ActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { NumericCellEditor } from 'src/app/ag-grid/cell-editors/NumericCellEditor';
import { AppModel } from 'src/app/pfm-common-models/AppModel';
import { Program } from 'src/app/programming-feature/models/Program';
import { FundingLineService } from 'src/app/programming-feature/services/funding-line.service';
import { map } from 'rxjs/operators';
import { FundingLine } from 'src/app/programming-feature/models/funding-line.model';
import { Asset } from 'src/app/programming-feature/models/asset.model';
import { AssetDetail } from 'src/app/programming-feature/models/asset-detail.model';
import { AssetService } from 'src/app/programming-feature/services/asset.service';
import { Observable } from 'rxjs';
import { TagService } from 'src/app/programming-feature/services/tag.service';
import { Tag } from 'src/app/programming-feature/models/Tag';

@Component({
  selector: 'pfm-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit {

  @Input() pomYear: number;
  @Input() program: Program;

  readonly CONTRACTOR_OR_MANUFACTURER = 'Contractor or Manufacturer';
  readonly TO_BE_USED_BY = 'To be Used By';

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
  showAssetGrid: boolean;
  toBeUsedByOptions: Tag[] = [];
  contractorOrManufacturerOptions: Tag[] = [];

  fundingLineOptions: any[] = [];
  selectedFundingLine: string;

  assetGridApi: GridApi;
  assetColumnApi: ColumnApi;
  assetColumnsDefinition: ColGroupDef[];
  assetRows: Asset[] = [];

  currentRowDataState: RowDataStateInterface = {};
  deleteDialog: DeleteDialogInterface = { title: 'Delete' };

  constructor(
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private fundingLineService: FundingLineService,
    private assetService: AssetService,
    private tagService: TagService,
    private appModel: AppModel
  ) { }

  ngOnInit() {
    if (!this.pomYear) {
      return;
    }
    this.loadForm();
    this.setupGrid();
  }

  private async setupGrid() {
    await this.loadToBeUsedBy();
    await this.loadcontractorOrManufacturer();
    this.setupAssetGrid();
  }

  private loadForm() {
    this.form = this.formBuilder.group({
      fundingLineSelect: [''],
      remarks: new FormControl('')
    });
    this.getFundingLineOptions();
    this.form.controls.fundingLineSelect.patchValue(0);
  }

  private async loadToBeUsedBy() {
    await this.tagService.getByType(this.TO_BE_USED_BY)
      .toPromise()
      .then(resp => {
        this.toBeUsedByOptions.push({
          id: null,
          abbr: 'NONE',
          name: 'Select',
          type: 'NONE'
        });
        this.toBeUsedByOptions.push(...resp.result as Tag[]);
        this.toBeUsedByOptions.push({
          id: null,
          abbr: 'NONE',
          name: this.appModel.userDetails.currentCommunity.abbreviation,
          type: 'NONE'
        });
      });
  }

  private async loadcontractorOrManufacturer() {
    await this.tagService.getByType(this.CONTRACTOR_OR_MANUFACTURER)
      .toPromise()
      .then(resp => {
        this.contractorOrManufacturerOptions.push({
          id: null,
          abbr: 'NONE',
          name: 'Select',
          type: 'NONE'
        });
        this.contractorOrManufacturerOptions.push(...resp.result as Tag[]);
      });
  }

  onChangeSuit(event: any) {
    this.form.get('fundingLineSelect').setValue(event.target.value, {
      onlySelf: true
    });
    this.selectedFundingLine = this.form.get('fundingLineSelect').value;
    if (this.selectedFundingLine.toLowerCase() !== '0') {
      this.assetService.obtainAssetsByFundingLineId(this.selectedFundingLine)
        .pipe(map(resp => resp.result as Asset[]))
        .subscribe(
          resp => {
            this.assetRows = resp.map(asset => ({ ...asset, action: this.actionState.VIEW }));
            this.showAssetGrid = true;
          },
          error => {
            this.dialogService.displayDebug(error);
          }
        );
    } else {
      this.showAssetGrid = false;
    }
  }

  private async getFundingLineOptions() {
    await this.fundingLineService.obtainFundingLinesByProgramId(this.program.id)
      .pipe(map(resp => {
        const fundingLines = resp.result as FundingLine[];
        return fundingLines.map(fundingLine => {
          const appn = fundingLine.appropriation ? fundingLine.appropriation : '';
          const baOrBlin = fundingLine.baOrBlin ? fundingLine.baOrBlin : '';
          const sag = fundingLine.sag ? fundingLine.sag : '';
          const wucd = fundingLine.wucd ? fundingLine.wucd : '';
          const expType = fundingLine.expenditureType ? fundingLine.expenditureType : '';
          return {
            id: fundingLine.id, value: [appn, baOrBlin, sag, wucd, expType].join('/')
          };
        });
      }))
      .toPromise()
      .then(
        resp => {
          this.fundingLineOptions = resp;
        },
        error => {
          this.dialogService.displayDebug(error);
        }
      );
  }

  onGridIsReady(assetGridApi: GridApi) {
    this.assetGridApi = assetGridApi;
    this.assetGridApi.setHeaderHeight(50);
    this.assetGridApi.setGroupHeaderHeight(25);
    this.assetGridApi.setRowData(this.assetRows);
  }

  onColumnIsReady(columnApi: ColumnApi) {
    this.assetColumnApi = columnApi;
  }

  onRowAdd(event: any) {
    if (this.currentRowDataState.isEditMode) {
      return;
    }
    const assetDetails: { [year: number]: AssetDetail } = {};
    for (let year = this.pomYear - 2; year < this.pomYear + 6; year++) {
      assetDetails[year] = {
        unitCost: 0,
        quantity: 0,
        totalCost: 0
      };
    }
    this.assetRows.push(
      {
        fundingLineId: this.selectedFundingLine,
        description: '',
        contractorOrManufacturer: '',
        toBeUsedBy: '',

        details: assetDetails,

        action: this.actionState.EDIT
      }
    );
    this.currentRowDataState.isAddMode = true;
    this.assetGridApi.setRowData(this.assetRows);
    this.editRow(this.assetRows.length - 1);
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

  private saveRow(rowIndex: number) {
    this.assetGridApi.stopEditing();
    const row = this.assetRows[rowIndex];
    const canSave = this.validateRowData(row);
    if (canSave) {
      if (row.contractorOrManufacturer.toLowerCase() === 'select') {
        row.contractorOrManufacturer = '';
      } else if (row.toBeUsedBy.toLowerCase() === 'select') {
        row.toBeUsedBy = '';
      }
      if (this.currentRowDataState.isAddMode || !row.id) {
        this.performSave(
          this.assetService.createAsset.bind(this.assetService),
          row,
          rowIndex
        );
      } else {
        this.performSave(
          this.assetService.updateAsset.bind(this.assetService),
          row,
          rowIndex
        );
      }
      this.viewMode(rowIndex);
    } else {
      this.editRow(rowIndex);
    }
  }

  private performSave(
    saveOrUpdate: (asset: Asset) => Observable<any>,
    asset: Asset,
    rowIndex: number
  ) {
    saveOrUpdate(asset)
      .pipe(map(resp => resp.result as Asset))
      .subscribe(
        assetResponse => {
          this.assetRows[rowIndex] = assetResponse;
          this.viewMode(rowIndex);
        },
        error => {
          this.dialogService.displayDebug(error);
          this.editRow(rowIndex);
        }
      );
  }

  private validateRowData(row: any) {
    let errorMessage = '';
    if (!row.description.length) {
      errorMessage = 'Asset Description cannot be empty.';
    } else if (row.description.length > 45) {
      errorMessage = 'Asset Description cannot have more than 45 characters.';
    }
    if (errorMessage.length) {
      this.dialogService.displayError(errorMessage);
    }
    return !errorMessage.length;
  }

  private cancelRow(rowIndex: number) {
    this.assetRows[rowIndex] = this.currentRowDataState.currentEditingRowData;
    this.viewMode(rowIndex);
  }

  private editRow(rowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.currentRowDataState.currentEditingRowData = { ...this.assetRows[rowIndex] };
    }
    this.editMode(rowIndex);
  }

  private deleteRow(rowIndex: number) {
    if (this.assetRows[rowIndex].id) {
      this.assetService.removeAssetById(this.assetRows[rowIndex].id)
        .subscribe(
          () => {
            this.performDelete(rowIndex);
          },
          error => {
            this.dialogService.displayDebug(error);
          });
    } else {
      this.performDelete(rowIndex);
    }
  }

  private performDelete(rowIndex: number) {
    this.assetRows.splice(rowIndex, 1);
    this.currentRowDataState.currentEditingRowIndex = 0;
    this.currentRowDataState.isEditMode = false;
    this.currentRowDataState.isAddMode = false;
    this.assetGridApi.stopEditing();
    this.assetRows.forEach(row => {
      row.isDisabled = false;
    });
    this.assetGridApi.setRowData(this.assetRows);
  }

  private viewMode(rowIndex: number) {
    this.currentRowDataState.currentEditingRowIndex = 0;
    this.currentRowDataState.isEditMode = false;
    this.currentRowDataState.isAddMode = false;
    this.assetGridApi.stopEditing();
    this.assetRows[rowIndex].action = this.actionState.VIEW;
    this.assetRows.forEach(row => {
      row.isDisabled = false;
    });
    this.assetGridApi.setRowData(this.assetRows);
  }

  private editMode(rowIndex: number) {
    this.currentRowDataState.currentEditingRowIndex = rowIndex;
    this.currentRowDataState.isEditMode = true;
    this.assetRows[rowIndex].action = this.actionState.EDIT;
    this.assetRows.forEach((row, index) => {
      if (rowIndex !== index) {
        row.isDisabled = true;
      }
    });
    this.assetGridApi.setRowData(this.assetRows);
    this.assetGridApi.startEditingCell({
      rowIndex,
      colKey: '0'
    });
  }

  onMouseDown(mouseEvent: MouseEvent) {
    if (this.currentRowDataState.isEditMode) {
      this.assetGridApi.startEditingCell({
        rowIndex: this.currentRowDataState.currentEditingRowIndex,
        colKey: '0'
      });
    }
  }

  private setupAssetGrid() {
    const columnGroups: any[] = [];
    for (let i = this.pomYear - 2, x = 0; i < this.pomYear + 6; i++, x++) {
      const headerName = i < this.pomYear ?
        'PY' + (this.pomYear - i === 1 ? '' : '-' + (this.pomYear - i - 1)) :
        i > this.pomYear ? 'BY' + (i === this.pomYear + 1 ? '' : '+' + (i - this.pomYear - 1)) :
          'CY';
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
                  colId: 2 + x * 3 + 1,
                  headerName: 'Unit Cost',
                  editable: i > this.pomYear,
                  suppressMovable: true,
                  filter: false,
                  sortable: false,
                  suppressMenu: true,
                  cellClass: 'numeric-class',
                  cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
                  minWidth: 80,
                  valueGetter: params => params.data.details[i].unitCost,
                  valueSetter: params => {
                    params.data.details[i].unitCost = Number(params.newValue);
                    return true;
                  },
                  cellEditor: NumericCellEditor.create({ returnUndefinedOnZero: false }),
                  valueFormatter: params => this.currencyFormatter(params.data.details[i].unitCost)
                },
                {
                  colId: 2 + x * 3 + 2,
                  headerName: 'Qty',
                  editable: i > this.pomYear,
                  suppressMovable: true,
                  suppressMenu: true,
                  filter: false,
                  sortable: false,
                  cellClass: 'numeric-class',
                  valueGetter: params => params.data.details[i].quantity,
                  valueSetter: params => {
                    params.data.details[i].quantity = Number(params.newValue);
                    return true;
                  },
                  cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
                  minWidth: 80,
                  cellEditor: NumericCellEditor.create({ returnUndefinedOnZero: false })
                },
                {
                  colId: 2 + x * 3 + 3,
                  headerName: 'Total Cost',
                  editable: i > this.pomYear,
                  suppressMovable: true,
                  suppressMenu: true,
                  filter: false,
                  sortable: false,
                  cellClass: 'numeric-class',
                  cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
                  minWidth: 80,
                  valueGetter: params => params.data.details[i].totalCost,
                  valueSetter: params => {
                    params.data.details[i].totalCost = Number(params.newValue);
                    return true;
                  },
                  cellEditor: NumericCellEditor.create({ returnUndefinedOnZero: false }),
                  valueFormatter: params => this.currencyFormatter(params.data.details[i].totalCost)
                }
              ]
            }
          ]
        }
      );
    }
    this.assetColumnsDefinition = [
      {
        groupId: 'main-header',
        headerName: 'Unit Costs in $K Total Costs in $M',
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            colId: 0,
            headerName: 'Asset Description',
            field: 'description',
            editable: true,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            pinned: 'left',
            cellClass: 'text-class',
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 180,
            minWidth: 180
          },
          {
            colId: 1,
            headerName: 'Contractor / Manufacturer',
            field: 'contractorOrManufacturer',
            editable: true,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            pinned: 'left',
            cellClass: 'text-class',
            cellStyle: {
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'flex-start',
              'white-space': 'normal'
            },
            maxWidth: 280,
            minWidth: 280,
            cellEditor: 'select',
            cellEditorParams: {
              cellHeight: 100,
              values: this.contractorOrManufacturerOptions.map(tag => tag.name)
            },
          },
          {
            colId: 2,
            headerName: 'To be Used By',
            field: 'toBeUsedBy',
            editable: true,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            pinned: 'left',
            cellClass: 'text-class',
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 120,
            minWidth: 120,
            cellEditor: 'select',
            cellEditorParams: {
              cellHeight: 100,
              values: this.toBeUsedByOptions.map(tag => tag.name)
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
            suppressMenu: true,
            pinned: 'right',
            cellRendererFramework: ActionCellRendererComponent,
            minWidth: 90
          }
        ]
      }
    ];
  }

  private currencyFormatter(params) {
    return '$ ' + Number(params).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  private headerClassFunc(params: any) {
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

  onTabToNextCell(params) {
    const rowIndex = params.previousCellPosition.rowIndex;
    const isBackward = params.backwards;

    let previousColId = Number(params.previousCellPosition.column.colDef.colId);

    // We need to skip non-editable columns
    if (previousColId === 2 && !isBackward) {
      previousColId = 11;
    } else if (previousColId === 12 && isBackward) {
      previousColId = 3;
    }

    // If we reach last column, do nothing.
    if (previousColId === 26 && !isBackward) {
      previousColId--;
    }

    // Auto-Calculate TotalCost
    if (previousColId > 2 && previousColId < 27) {
      if ((previousColId - 2) % 3 === 2) { // Quantity Column
        const unitCostInput: any = window.document
          .querySelector('div[row-index="' + rowIndex + '"] > div[col-id="' + (previousColId - 1) + '"] > input');
        const quantityInput: any = window.document
          .querySelector('div[row-index="' + rowIndex + '"] > div[col-id="' + previousColId + '"] > input');
        const totalCostInput: any = window.document
          .querySelector('div[row-index="' + rowIndex + '"] > div[col-id="' + (previousColId + 1) + '"] > input');
        totalCostInput.value = unitCostInput.value * quantityInput.value;
      }
    }

    const nextColumn = this.assetColumnApi.getColumn(isBackward ? --previousColId : ++previousColId);
    const nextCell: CellPosition = {
      rowIndex,
      column: nextColumn,
      rowPinned: undefined
    };

    return nextCell;
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
