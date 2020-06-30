import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { PlanningService } from '../services/planning-service';
import { ListItem } from '../../pfm-common-models/ListItem';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { MissionPriority } from '../models/MissionPriority';
import { AttachmentCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/attachment-cell-renderer/attachment-cell-renderer.component';
import { DataGridMessage } from '../../pfm-coreui/models/DataGridMessage';
import { CellPosition, Column, ColumnApi, GridApi } from '@ag-grid-community/all-modules';
import { AppModel } from '../../pfm-common-models/AppModel';
import { FileMetaData } from '../../pfm-common-models/FileMetaData';
import { Attachment } from '../../pfm-common-models/Attachment';
import { SecureDownloadComponent } from '../../pfm-secure-filedownload/secure-download/secure-download.component';
import { PlanningPhase } from '../models/PlanningPhase';
import { ToastService } from 'src/app/pfm-coreui/services/toast.service';
import { MpActionCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/mp-action-cell-renderer/mp-action-cell-renderer.component';
import { PlanningStatus } from '../models/enumerators/planning-status.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pfm-planning',
  templateUrl: './mission-priorities.component.html',
  styleUrls: ['./mission-priorities.component.scss']
})
export class MissionPrioritiesComponent implements OnInit {
  @ViewChild(DropdownComponent) yearDropDown: DropdownComponent;
  @ViewChild(SecureDownloadComponent) secureDownloadComponent: SecureDownloadComponent;

  actionState = {
    VIEW: {
      canSave: false,
      canEdit: true,
      canDelete: true,
      canUpload: false,
      hideCheckmark: false
    },
    USER_VIEW: {
      canSave: false,
      canEdit: false,
      canDelete: false,
      canUpload: false,
      hideCheckmark: true
    },
    PLANNING_CREATED_VIEW: {
      canSave: false,
      canEdit: true,
      canDelete: true,
      canUpload: false,
      hideCheckmark: true
    },
    PLANNING_OPEN_VIEW_PLANNER: {
      canSave: false,
      canEdit: true,
      canDelete: false,
      canUpload: false,
      hideCheckmark: true
    },
    PLANNING_OPEN_VIEW_PLANNER_MANAGER: {
      canSave: false,
      canEdit: true,
      canDelete: false,
      canUpload: false,
      hideCheckmark: false
    },
    PLANNING_LOCKED_VIEW: {
      canSave: false,
      canEdit: false,
      canDelete: false,
      canUpload: false,
      hideCheckmark: false
    },
    PLANNING_CLOSED_VIEW: {
      canSave: false,
      canEdit: false,
      canDelete: false,
      canUpload: false,
      hideCheckmark: false,
      switchCheckmark: true
    },
    EDIT: {
      canEdit: false,
      canSave: true,
      canDelete: true,
      canUpload: true,
      hideCheckmark: true
    },
    PLANNING_OPEN_EDIT: {
      canEdit: false,
      canSave: true,
      canDelete: false,
      canUpload: true,
      hideCheckmark: true
    }
  };

  ctaOptions: ListItem[];
  missionPriorityOptions: ListItem[] = [
    {
      name: 'Add a new row',
      value: 'add-single-row',
      id: 'add-single-row',
      isSelected: false,
      rawData: null
    },
    {
      name: 'Add all rows from another year',
      value: 'add-rows-from-year',
      id: 'add-rows-from-year',
      isSelected: false,
      rawData: null
    }
  ];

  showDeleteAttachmentDialog: boolean;
  showDeleteRowDialog: boolean;
  showImportYearDialog: boolean;

  gridApi: GridApi;
  columnApi: ColumnApi;
  id = 'mission-priorities-component';
  busy: boolean;
  availableYears: ListItem[];
  selectedYear: string;
  selectedPlanningPhase: PlanningPhase;
  missionData: MissionPriority[];
  canPerformCreatePlanning: boolean;
  canPerformOpenPlanning: boolean;
  canPerformLockPlanning: boolean;
  canPerformClosePlanning: boolean;
  canPerformActions: boolean;
  showUploadDialog: boolean;
  selectedRowIndex: number;
  selectedRow: MissionPriority;
  selectedImportYear: string;
  availableImportYears: ListItem[];
  canAddNewRow: boolean;
  canShowOpenCTA: boolean;
  canShowLockCTA: boolean;
  canShowCloseCTA: boolean;

  columns: any[];
  rowDragEnterEvent: any;
  rowDragLeaveEvent: any;
  missionDataFromServer: MissionPriority[];

  planningData: any[];
  currentRowDataState: RowDataStateInterface = {};

  constructor(
    private appModel: AppModel,
    private planningService: PlanningService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.canPerformCreatePlanning = !!this.appModel.visibilityDef['planning-phase-component']?.createPlanningPhase;
    this.canPerformOpenPlanning = !!this.appModel.visibilityDef['planning-phase-component']?.openPlanningPhase;
    this.canPerformLockPlanning = !!this.appModel.visibilityDef['planning-phase-component']?.lockPlanningPhase;
    this.canPerformClosePlanning = !!this.appModel.visibilityDef['planning-phase-component']?.closePlanningPhase;
    this.canPerformActions = !!this.appModel.visibilityDef['planning-phase-component']?.performAction;
    this.setupGrid();
    // POM Manager is here for demo purpose
    const years: string[] = [];
    const status: string[] = [
      PlanningStatus.CREATED,
      PlanningStatus.OPEN,
      PlanningStatus.LOCKED,
      PlanningStatus.CLOSED
    ];
    this.busy = true;
    this.planningService.getAllPlanning().subscribe(
      resp => {
        this.planningData = (resp as any).result;
        for (const item of this.planningData) {
          if (status.indexOf(item.state) !== -1) {
            years.push(item.name);
          }
        }
        // trigger a default selection
        if (this.appModel.selectedYear) {
          this.selectedYear = this.appModel.selectedYear;
          this.appModel.selectedYear = undefined;
          this.yearSelected({ name: this.selectedYear });
          if (this.selectedYear) {
            this.canAddNewRow =
              this.selectedPlanningPhase.state !== PlanningStatus.LOCKED &&
              this.selectedPlanningPhase.state !== PlanningStatus.CLOSED &&
              this.canPerformActions;
            const isOpenPhase = !!this.route.snapshot.paramMap.get('openPhase');
            const isLockPhase = !!this.route.snapshot.paramMap.get('lockPhase');
            const isClosePhase = !!this.route.snapshot.paramMap.get('closePhase');
            if (this.selectedPlanningPhase.state === PlanningStatus.CREATED && isOpenPhase) {
              this.canShowOpenCTA = true;
            } else if (this.selectedPlanningPhase.state === PlanningStatus.OPEN && !isLockPhase) {
              this.ctaOptions.splice(1, 1);
            } else if (this.selectedPlanningPhase.state === PlanningStatus.OPEN && isLockPhase) {
              this.canShowLockCTA = true;
            } else if (this.selectedPlanningPhase.state === PlanningStatus.LOCKED && isClosePhase) {
              this.canShowCloseCTA = true;
            }
          }
        }
        this.availableYears = this.toListItem(years);
      },
      error => {
        this.dialogService.displayDebug(error);
      },
      () => (this.busy = false)
    );
  }

  private setupGrid() {
    this.columns = [
      {
        headerName: 'Priority',
        field: 'priority',
        maxWidth: 75,
        minWidth: 75,
        rowDrag: true,
        rowDragManaged: true,
        valueGetter(params) {
          return params.node.rowIndex + 1;
        },
        cellClass: 'numeric-class',
        cellStyle: { display: 'flex', 'align-items': 'right' }
      },
      {
        headerName: 'Mission Title',
        field: 'title',
        editable: true,
        maxWidth: 400,
        minWidth: 400,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
      },
      {
        headerName: 'Mission Description',
        field: 'description',
        editable: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
      },
      {
        headerName: 'Attachments',
        field: 'attachments',
        maxWidth: 225,
        minWidth: 225,
        cellRendererFramework: AttachmentCellRendererComponent
      },
      {
        headerName: 'Actions',
        field: 'actions',
        minWidth: 175,
        maxWidth: 175,
        cellRendererFramework: MpActionCellRendererComponent
      }
    ];
    this.tabToNextCell = this.tabToNextCell.bind(this);
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.rowDragEnterEvent && this.rowDragLeaveEvent) {
      if (this.rowDragLeaveEvent.event.timeStamp > this.rowDragEnterEvent.event.timeStamp) {
        this.rowDragEnterEvent = null;
        this.rowDragLeaveEvent = null;
        this.missionData = [...this.missionDataFromServer];
      }
    }
  }

  onBtSuppressRowDrag() {
    if (this.selectedPlanningPhase.state === 'CLOSED') {
      this.gridApi.setSuppressRowDrag(true);
    }
  }

  onRowDragEnter(event: any): void {
    this.rowDragEnterEvent = event;
  }

  onRowDragLeave(event: any): void {
    this.rowDragLeaveEvent = event;
  }

  onRowDragEnd(event: any): void {
    // Ensure drag ended in grid before moving anything
    if (event.overIndex >= 0) {
      this.rowDragEnterEvent = null;
      this.rowDragLeaveEvent = null;
      const newIndex: number = event.overIndex;
      const oldIndex: number = event.node.data.order - 1;

      if (newIndex !== oldIndex) {
        // Move mp to new position
        this.missionData.splice(newIndex, 0, this.missionData.splice(oldIndex, 1)[0]);
        // Update order in model and server
        if (newIndex < oldIndex) {
          for (let i = newIndex; i <= oldIndex; i++) {
            this.missionData[i].order = i + 1;
          }
          this.updateRows(newIndex, oldIndex + 1);
        } else {
          for (let i = oldIndex; i <= newIndex; i++) {
            this.missionData[i].order = i + 1;
          }
          this.updateRows(oldIndex, newIndex + 1);
        }
      }
    }
    // Let the grid know about any changes
    this.gridApi.setRowData(this.missionData);
  }

  onGridIsReady(gridApi: GridApi): void {
    this.gridApi = gridApi;
    this.onBtSuppressRowDrag();
  }

  onColumnIsReady(columnApi: ColumnApi): void {
    this.columnApi = columnApi;
  }

  handleCellAction(cellAction: DataGridMessage): void {
    switch (cellAction.message) {
      case 'save':
        this.saveRow(cellAction.rowIndex);
        break;
      case 'edit':
        if (!this.currentRowDataState.isEditMode) {
          this.editRow(cellAction.rowIndex, true);
        }
        break;
      case 'upload':
        this.addAttachment(cellAction.rowIndex);
        break;
      case 'delete-row':
        if (!this.currentRowDataState.isEditMode) {
          this.deleteRow(cellAction.rowIndex);
        }
        break;
      case 'delete-attachments':
        this.deleteAttachments(cellAction.rowIndex);
        break;
      case 'download-attachment':
        this.downloadAttachment(cellAction);
        break;
      case 'toggle-select':
        this.toggleSelect(cellAction.rowIndex);
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

  private downloadAttachment(cellAction: DataGridMessage): void {
    this.secureDownloadComponent.downloadFile(cellAction.rawData.file);
  }

  onAddNewRow(event: any): void {
    if (this.currentRowDataState.isEditMode) {
      return;
    }
    if (event.action === 'add-single-row') {
      this.currentRowDataState.isAddMode = true;
      this.currentRowDataState.currentEditingRowData = null;
      const mp = new MissionPriority();
      if (this.missionData.length === 0) {
        mp.order = 1;
      } else {
        mp.order = this.missionData.length + 1;
      }
      mp.title = '';
      mp.description = '';
      mp.attachments = [];
      mp.attachmentsDisabled = true;
      mp.selected = false;
      mp.actions = this.actionEditSetup();
      this.missionData.push(mp);

      this.gridApi.setRowData(this.missionData);

      this.editRow(this.missionData.length - 1);
    } else if (event.action === 'add-rows-from-year') {
      this.availableImportYears = [];
      for (const availableYear of this.availableYears) {
        if (availableYear.name !== this.selectedYear) {
          this.availableImportYears[this.availableImportYears.length] = availableYear;
        }
      }
      // year selection dialog
      this.showImportYearDialog = true;
    }
  }

  importYearSelected(year: ListItem) {
    // update value
    this.selectedImportYear = year.value;
  }

  onImportYear() {
    // import rows from selected year.
    if (this.selectedImportYear) {
      this.busy = true;
      this.planningService.cloneMissionPriorities(this.selectedImportYear + '_id').subscribe(
        resp => {
          const result = (resp as any).result;
          if (result instanceof Array && result.length !== 0) {
            const orderBase = this.missionData.length;
            for (const mp of result as Array<MissionPriority>) {
              this.initClientMP(mp);
              mp.planningPhaseId = this.selectedPlanningPhase.id;
              mp.order = mp.order + orderBase;
              this.missionData[mp.order - 1] = mp;
            }
            // Update Grid
            this.gridApi.setRowData(this.missionData);
            this.busy = false;
            // Save to Database
            this.updateRows(orderBase);
          }
        },
        error => {
          this.busy = false;
          this.dialogService.displayDebug(error);
        }
      );
    }
  }

  yearSelected(year: any): void {
    this.canShowOpenCTA = false;
    this.canShowLockCTA = false;
    this.canShowCloseCTA = false;
    this.selectedYear = year ? year.name : undefined;
    if (this.selectedYear) {
      this.busy = true;
      this.selectedPlanningPhase = this.planningData.find(obj => obj.id === this.selectedYear + '_id');
      this.canAddNewRow =
        this.selectedPlanningPhase.state !== PlanningStatus.LOCKED &&
        this.selectedPlanningPhase.state !== PlanningStatus.CLOSED &&
        this.canPerformActions;
      if (this.selectedPlanningPhase.state === PlanningStatus.OPEN) {
        this.ctaOptions = [...this.missionPriorityOptions].splice(0, 1);
      } else {
        this.ctaOptions = [...this.missionPriorityOptions];
      }
      this.planningService.getMissionPriorities(this.selectedPlanningPhase.id).subscribe(
        resp => {
          this.busy = false;
          const result = (resp as any).result;
          if (result instanceof Array) {
            this.missionData = new Array<MissionPriority>(result.length);
            for (const mp of result as Array<MissionPriority>) {
              this.initClientMP(mp);
              this.missionData[mp.order - 1] = mp;
            }
            this.missionDataFromServer = [...this.missionData];
          }
        },
        error => {
          this.busy = false;
          this.dialogService.displayDebug(error);
        }
      );
    }
  }

  handleNewAttachments(newFile: FileMetaData): void {
    this.showUploadDialog = false;
    if (newFile) {
      // undefined is returned for cancel/errors, so only proceed if we have a value
      // wrap the FileMetaData in an Attachment object
      const attachment: Attachment = new Attachment();
      attachment.file = newFile;
      attachment.mpId = this.missionData[this.selectedRowIndex].id;
      // add attachment
      this.missionData[this.selectedRowIndex].attachments.push(attachment);
      // update data
      this.gridApi.setRowData(this.missionData);
    }
  }

  onOpenPlanningPhase(): void {
    if (this.yearDropDown.isValid()) {
      this.dialogService.displayError('not implemented');
    }
  }

  private toListItem(years: string[]): ListItem[] {
    const items: ListItem[] = [];
    for (const year of years) {
      const item: ListItem = new ListItem();
      item.id = year;
      item.name = year;
      item.value = year;
      if (year === this.selectedYear) {
        item.isSelected = true;
      }
      items.push(item);
    }
    return items;
  }

  private editMode(rowIndex: number) {
    this.currentRowDataState.currentEditingRowIndex = rowIndex;
    this.currentRowDataState.isEditMode = true;
    this.missionData.forEach((row, index) => {
      if (rowIndex !== index) {
        row.isDisabled = true;
      }
    });
    this.gridApi.setSuppressRowDrag(true);
    // toggle actions
    this.missionData[rowIndex].actions = this.actionEditSetup();
    // disable attachments dropdown
    this.missionData[rowIndex].attachmentsDisabled = true;
    this.gridApi.setRowData(this.missionData);
    this.gridApi.startEditingCell({
      rowIndex,
      colKey: 'title'
    });
  }

  private viewMode(rowIndex: number) {
    this.currentRowDataState.currentEditingRowIndex = 0;
    this.currentRowDataState.isEditMode = false;
    this.currentRowDataState.isAddMode = false;
    this.missionData.forEach(row => {
      row.isDisabled = false;
    });
    this.gridApi.setSuppressRowDrag(false);
    // Toggle actions
    this.gridApi.stopEditing();
    this.missionData[rowIndex].actions = this.actionViewSetup();
    // Enable attachments dropdown
    this.missionData[rowIndex].attachmentsDisabled = false;
    this.gridApi.setRowData(this.missionData);
  }

  private saveRow(rowIndex: number) {
    let errorMsg = '';
    let isError = false;

    // Note stopEditing saves edits to model.  Since changes aren't saved to server if validation fails this is ok.
    this.gridApi.stopEditing();
    const row: MissionPriority = this.missionData[rowIndex];

    // Check columns Title max 45 chars, description max 200 chars
    if (
      row.title?.length <= 45 &&
      row.title?.length > 0 &&
      row.description?.length <= 200 &&
      row.description?.length > 0
    ) {
      // Convert to server mp
      const serverMp: MissionPriority = this.convertToServerMP(row);
      serverMp.planningPhaseId = this.selectedPlanningPhase.id;
      this.busy = true;
      // Create or update? Check for presence of mp id
      if (!serverMp.id) {
        this.planningService.createMissionPriority(serverMp).subscribe(
          resp => {
            this.busy = false;
            this.missionData[rowIndex] = (resp as any).result;
            this.missionData[rowIndex].actions = this.actionEditSetup();

            // Update view
            this.viewMode(rowIndex);
            this.gridApi.setRowData(this.missionData);
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
          }
        );
      } else {
        // Ensure creation information is preserved
        this.planningService.updateMissionPriority([serverMp]).subscribe(
          resp => {
            this.busy = false;
            // Update view
            this.viewMode(rowIndex);
            this.gridApi.setRowData(this.missionData);
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
          }
        );
      }
    } else {
      if (!row.title?.length) {
        errorMsg = 'The Title is empty. ';
        isError = true;
      }
      if (!row.description?.length) {
        errorMsg = errorMsg + 'The Description is empty. ';
        isError = true;
      }
      if (row.title?.length > 45) {
        errorMsg = errorMsg + 'The Title is longer than the max of 45 characters. ';
        isError = true;
      }
      if (row.description?.length > 200) {
        errorMsg = errorMsg + 'The Description is longer than the max of 200 characters.';
        isError = true;
      }
      if (isError) {
        this.dialogService.displayError(errorMsg);
      }
      this.editRow(rowIndex);
    }
  }

  private updateRows(beginRowIndex: number, endRowIndex?: number) {
    const clientMPs = this.missionData.slice(beginRowIndex, endRowIndex);
    // Ensure there is something to update
    if (clientMPs.length) {
      this.busy = true;
      // Create copies of updated mps with client only properties excluded, server doesn't know about them
      const updateMps: MissionPriority[] = new Array<MissionPriority>();
      for (const clientMP of clientMPs) {
        updateMps.push(this.convertToServerMP(clientMP));
      }
      this.planningService.updateMissionPriority(updateMps).subscribe(
        () => {},
        error => {
          this.dialogService.displayDebug(error);
        },
        () => (this.busy = false)
      );
    }
  }

  private editRow(rowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.currentRowDataState.currentEditingRowData = {
        ...JSON.parse(JSON.stringify(this.missionData[rowIndex]))
      };
    }
    // edit mode
    this.editMode(rowIndex);
  }

  private deleteRow(rowIndex: number) {
    if (this.missionData[rowIndex].id) {
      this.selectedRowIndex = rowIndex;
      this.showDeleteRowDialog = true;
    } else {
      this.performDelete(rowIndex);
    }
  }

  onDeleteRow(rowIndex: number) {
    this.busy = true;
    this.planningService.deleteMissionPriority(this.missionData[rowIndex].id).subscribe(
      resp => {
        this.performDelete(rowIndex);
      },
      error => {
        this.dialogService.displayDebug(error);
      },
      () => (this.busy = false)
    );
    this.showDeleteRowDialog = false;
  }

  private performDelete(rowIndex: number) {
    this.currentRowDataState.currentEditingRowIndex = 0;
    this.currentRowDataState.isEditMode = false;
    this.currentRowDataState.isAddMode = false;
    this.missionData.forEach(row => {
      row.isDisabled = false;
    });
    this.missionData.splice(rowIndex, 1);
    for (let i = rowIndex; i < this.missionData.length; i++) {
      this.missionData[i].order = this.missionData[i].order - 1;
    }
    // Update view
    this.gridApi.setRowData(this.missionData);
    // Let service know about ordering changes
    this.updateRows(rowIndex);
  }

  private addAttachment(rowIndex: number): void {
    this.selectedRowIndex = rowIndex;
    this.showUploadDialog = true;
  }

  private deleteAttachments(rowIndex: number) {
    this.selectedRowIndex = rowIndex;
    this.selectedRow = this.missionData[rowIndex];
    this.showDeleteAttachmentDialog = true;
  }

  private onDeleteAttachments(): void {
    // Get number of attachments to check if any have been removed
    const attachmentCount = this.selectedRow.attachments.length;

    // Possibly removing items from array while iterating over it - do in reverse and things just work
    for (let i = this.selectedRow.attachments.length - 1; i >= 0; --i) {
      if (this.selectedRow.attachments[i].selectedForDelete === true) {
        this.selectedRow.attachments.splice(i, 1);
      }
    }

    // If the attachment count has changed update the server, otherwise notify the user to select an attachment
    if (attachmentCount !== this.selectedRow.attachments.length) {
      this.saveRow(this.selectedRowIndex);
      this.dialogService.displayInfo('Attachment(s) successfully deleted from the mission.');
    } else {
      this.dialogService.displayError('Select one or more attachments.');
    }
  }

  // Overwrite tab functionality to tab back and forth from title and description
  private tabToNextCell(params) {
    const rowIndex = params.previousCellPosition.rowIndex;
    let nextColumn: Column;
    let nextCell: CellPosition = params.nextCellPosition;
    // if the column is title
    if (params.previousCellPosition.column.colId === 'title' && params.backwards === true) {
      nextColumn = this.columnApi.getColumn('description');
      nextCell = {
        rowIndex,
        column: nextColumn,
        rowPinned: undefined
      };
    } else if (params.previousCellPosition.column.colId === 'description' && params.backwards === false) {
      nextColumn = this.columnApi.getColumn('title');
      nextCell = {
        rowIndex,
        column: nextColumn,
        rowPinned: undefined
      };
    }
    return nextCell;
  }

  openPlanningPhase() {
    this.busy = true;
    const year: any = this.selectedYear;
    this.planningService.openPlanningPhase(this.selectedPlanningPhase).subscribe(
      resp => {
        this.busy = false;
        // Update model state
        this.selectedPlanningPhase.state = PlanningStatus.OPEN;
        this.toastService.displaySuccess(`Planning phase for ${year} successfully opened.`);
        this.yearSelected({ name: this.selectedYear });
      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      }
    );
  }

  lockPlanningPhase() {
    const hasCheckmarkSelected = this.missionData.filter(mission => mission.selected);
    if (hasCheckmarkSelected.length) {
      this.busy = true;
      this.planningService.lockPlanningPhase(this.selectedPlanningPhase).subscribe(
        resp => {
          this.busy = false;
          // Update model state
          this.selectedPlanningPhase.state = PlanningStatus.LOCKED;
          this.toastService.displaySuccess(`Planning Phase for ${this.selectedYear} successfully locked.`);
          this.yearSelected({ name: this.selectedYear });
        },
        error => {
          this.busy = false;
          this.dialogService.displayDebug(error);
        }
      );
    } else {
      this.toastService.displayError(
        'Please select at least one row in the grid. To do this, click the amber checkmark to change it to green.'
      );
    }
  }

  closePlanningPhase() {
    const hasCheckmarkSelected = this.missionData.filter(mission => mission.selected);
    if (hasCheckmarkSelected.length) {
      this.busy = true;
      this.planningService.closePlanningPhase(this.selectedPlanningPhase).subscribe(
        resp => {
          this.busy = false;
          // Update model state
          this.gridApi.setSuppressRowDrag(true);
          this.selectedPlanningPhase.state = PlanningStatus.CLOSED;
          this.toastService.displaySuccess(`Planning Phase for ${this.selectedYear} successfully closed.`);
          this.yearSelected({ name: this.selectedYear });
        },
        error => {
          this.busy = false;
          this.dialogService.displayDebug(error);
        }
      );
    } else {
      this.toastService.displayError(
        'Please select at least one row in the grid. To do this, click the amber checkmark to change it to green.'
      );
    }
  }

  cancelDialog() {
    this.showDeleteAttachmentDialog = false;
    this.showImportYearDialog = false;
  }

  private convertToServerMP(clientMP: MissionPriority): MissionPriority {
    // The server doesn't know anything about some client side properties of the MissionPriority.  Copy clientMP but
    // exclude those properties that the server doesn't know anything about.
    // Note - ignoring update properties due to server setting during call
    const serverMP: MissionPriority = new MissionPriority();
    serverMP.attachments = clientMP.attachments;
    serverMP.created = clientMP.created;
    serverMP.createdBy = clientMP.createdBy;
    serverMP.description = clientMP.description;
    serverMP.id = clientMP.id;
    serverMP.order = clientMP.order;
    serverMP.planningPhaseId = clientMP.planningPhaseId;
    serverMP.title = clientMP.title;
    serverMP.selected = clientMP.selected;
    return serverMP;
  }

  private initClientMP(clientMP: MissionPriority): void {
    if (!clientMP.attachments) {
      clientMP.attachments = [];
    }
    if (!clientMP.attachmentsDisabled) {
      clientMP.attachmentsDisabled = false;
    }
    if (!clientMP.actions) {
      clientMP.actions = this.actionViewSetup();
    }
  }

  private toggleSelect(rowIndex: number) {
    this.missionData[rowIndex].selected = !this.missionData[rowIndex].selected;
    this.saveRow(rowIndex);
  }

  private actionViewSetup() {
    if (this.canPerformActions) {
      if (this.selectedPlanningPhase.state === PlanningStatus.CREATED) {
        return this.actionState.PLANNING_CREATED_VIEW;
      } else if (this.selectedPlanningPhase.state === PlanningStatus.OPEN && !this.canPerformOpenPlanning) {
        return this.actionState.PLANNING_OPEN_VIEW_PLANNER;
      } else if (this.selectedPlanningPhase.state === PlanningStatus.OPEN && this.canPerformOpenPlanning) {
        return this.actionState.PLANNING_OPEN_VIEW_PLANNER_MANAGER;
      } else if (this.selectedPlanningPhase.state === PlanningStatus.LOCKED && this.canPerformLockPlanning) {
        return this.actionState.PLANNING_LOCKED_VIEW;
      } else if (this.selectedPlanningPhase.state === PlanningStatus.LOCKED && !this.canPerformLockPlanning) {
        return null;
      } else if (this.selectedPlanningPhase.state === PlanningStatus.CLOSED) {
        return this.actionState.PLANNING_CLOSED_VIEW;
      }
    }
    return this.canPerformActions ||
      this.canPerformCreatePlanning ||
      this.canPerformOpenPlanning ||
      this.canPerformLockPlanning ||
      this.canPerformClosePlanning
      ? this.actionState.VIEW
      : this.actionState.USER_VIEW;
  }

  private actionEditSetup() {
    if (this.selectedPlanningPhase.state === PlanningStatus.OPEN) {
      return this.actionState.PLANNING_OPEN_EDIT;
    }
    return this.canPerformActions ||
      this.canPerformActions ||
      this.canPerformCreatePlanning ||
      this.canPerformOpenPlanning ||
      this.canPerformLockPlanning ||
      this.canPerformClosePlanning
      ? this.actionState.EDIT
      : null;
  }

  private cancelRow(rowIndex: number) {
    this.missionData[rowIndex] = this.currentRowDataState.currentEditingRowData;
    this.viewMode(rowIndex);
  }

  onMouseDown(mouseEvent: MouseEvent) {
    if (this.currentRowDataState.isEditMode) {
      this.gridApi.startEditingCell({
        rowIndex: this.currentRowDataState.currentEditingRowIndex,
        colKey: 'title'
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
