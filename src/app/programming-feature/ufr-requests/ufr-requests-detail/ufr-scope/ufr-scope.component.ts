import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ColDef, GridApi } from '@ag-grid-community/all-modules';
import { ActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { DatePickerCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/date-picker-cell-renderer/date-picker-cell-renderer.component';
import { DatePickerCellEditorComponent } from 'src/app/pfm-coreui/datagrid/renderers/date-picker-cell-editor/date-picker-cell-editor.component';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { FileMetaData } from 'src/app/pfm-common-models/FileMetaData';
import { Attachment } from 'src/app/pfm-common-models/Attachment';
import { Program } from '../../../models/Program';
import { EvaluationMeasureService } from '../../../services/evaluation-measure.service';
import { ProcessPrioritizationService } from '../../../services/process-prioritization.service';
import { TeamLeadService } from '../../../services/team-lead.service';
import * as moment from 'moment';
import { FormControl, FormGroup } from '@angular/forms';
import { SecureDownloadComponent } from 'src/app/pfm-secure-filedownload/secure-download/secure-download.component';
import { ListItem } from 'src/app/pfm-common-models/ListItem';
import { DropdownCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/dropdown-cell-renderer/dropdown-cell-renderer.component';
import { Schedule } from '../../../models/schedule.model';
import { FundingLine } from '../../../models/funding-line.model';
import { UfrService } from 'src/app/programming-feature/services/ufr-service';
import { UFR } from 'src/app/programming-feature/models/ufr.model';

@Component({
  selector: 'pfm-ufr-scope',
  templateUrl: './ufr-scope.component.html',
  styleUrls: ['./ufr-scope.component.scss']
})
export class UfrScopeComponent implements OnInit {
  @ViewChild(SecureDownloadComponent)
  secureDownloadComponent: SecureDownloadComponent;

  @Input() ufr: UFR;

  @Input() pomYear: number;

  form: FormGroup;

  actionState = {
    VIEW: {
      canSave: false,
      canEdit: true,
      canDelete: true,
      canUpload: false,
      isSingleDelete: true,
      editMode: false
    },
    EDIT: {
      canEdit: false,
      canSave: true,
      canDelete: true,
      canUpload: false,
      isSingleDelete: true,
      editMode: false
    }
  };

  priorityRankingOptions = ['None', 'High', 'Medium', 'Low'];

  busy: boolean;

  budget: number;
  schedule: string;

  showUploadDialog: boolean;

  evaluationMeasureGridApi: GridApi;
  teamLeadGridApi: GridApi;
  processPriorizationGridApi: GridApi;

  evaluationMeasureColumnDefinitions: ColDef[];
  teamLeadsColumnDefinitions: ColDef[];
  processPriorizationColumnDefinitions: ColDef[];

  evaluationMeasureRows: any[] = [];
  teamLeadRows: any[] = [];
  processPriorizationRows: any[] = [];

  currentEvaluationMeasureRowDataState: RowDataStateInterface = {};
  currentTeamLeadRowDataState: RowDataStateInterface = {};
  currentProcessPriorizationRowDataState: RowDataStateInterface = {};

  attachmentsUploaded: ListItem[] = [];
  programAttachments: Attachment[] = [];
  deleteDialog: DeleteDialogInterface = { title: 'Delete' };
  editMode: boolean;

  constructor(
    private evaluationMeasureService: EvaluationMeasureService,
    private processPrioritizationService: ProcessPrioritizationService,
    private teamLeadService: TeamLeadService,
    private dialogService: DialogService,
    private ufrService: UfrService
  ) {}

  ngOnInit() {
    this.loadForm();
    this.loadExternalInfo();
    this.updateForm(this.ufr);

    this.setupEvaluationMeasureGrid();
    this.setupTeamLeadsGrid();
    this.setupProcessPriorizationGrid();
    this.editMode = history.state.editMode;
    this.changeEditMode(this.editMode);
  }

  loadForm() {
    this.form = new FormGroup({
      aim: new FormControl(''),
      goal: new FormControl(''),
      quality: new FormControl(''),
      other: new FormControl('')
    });
  }

  loadExternalInfo() {
    this.ufrService.getByContainerId(this.ufr.id).subscribe(resp => {
      const ufrRetrieved = resp.result as UFR;
      this.loadBudget(ufrRetrieved.fundingLines);
      this.loadScheduleRange(ufrRetrieved.schedules);
    });
  }

  loadBudget(fundingLines: Array<FundingLine>) {
    let total = 0;
    fundingLines?.forEach(fundingLine => {
      for (let i = this.pomYear; i < this.pomYear + 5; i++) {
        total += Number(fundingLine.funds[i] ?? 0);
      }
    });
    this.budget = total;
  }

  loadScheduleRange(schedules: Array<Schedule>) {
    if (schedules?.length) {
      const startDate = schedules.map(x => x.startDate).sort((a, b) => a.diff(b))[0];
      const endDate = schedules.map(x => x.endDate).sort((a, b) => b.diff(a))[0];

      this.schedule = `${startDate.format('MMM. D, YYYY')} - ${endDate.format('MMM. D, YYYY')}`;
    } else {
      this.schedule = '';
    }
  }

  downloadAttachment(file: ListItem) {
    const fileMetaData = new FileMetaData();
    fileMetaData.id = file.id;
    fileMetaData.name = file.name;
    this.secureDownloadComponent.downloadFile(fileMetaData);
  }

  updateForm(program: Program) {
    this.programAttachments = [...program.attachments];
    this.programAttachments.forEach(attachment => {
      this.attachmentsUploaded.push({
        id: attachment.file.id,
        isSelected: false,
        name: attachment.file.name,
        value: attachment.file.id,
        rawData: attachment
      });
    });
    this.form.patchValue({
      aim: program.aim,
      goal: program.goal,
      quality: program.quality,
      other: program.other
    });
  }

  loadEvaluationMeasures() {
    this.evaluationMeasureService.getByContainerId(this.ufr.id).subscribe(resp => {
      const result = (resp as any).result;
      this.evaluationMeasureRows = result;
      for (let i = 0; i < result.length; i++) {
        const obj = result[i];
        if (obj.currentPerformanceDate) {
          obj.currentPerformanceDate = obj.currentPerformanceDate.format('MM/DD/YYYY');
        }
        this.viewEvaluationMeasureMode(i);
      }
    });
  }

  loadTeamLeads() {
    this.teamLeadService.getByContainerId(this.ufr.id).subscribe(resp => {
      const result = (resp as any).result;
      this.teamLeadRows = result;
      for (let i = 0; i < result.length; i++) {
        this.viewTeamLeadMode(i);
      }
    });
  }

  loadProcessPrioritizations() {
    this.processPrioritizationService.getByContainerId(this.ufr.id).subscribe(resp => {
      const result = (resp as any).result;
      this.processPriorizationRows = result;
      for (let i = 0; i < result.length; i++) {
        const obj = result[i];
        if (obj.estimatedCompletionDate) {
          obj.estimatedCompletionDate = obj.estimatedCompletionDate.format('MM/DD/YYYY');
        }
        this.viewProcessPriorizationMode(i);
      }
    });
  }

  setupEvaluationMeasureGrid() {
    this.evaluationMeasureColumnDefinitions = [
      {
        headerName: 'Measure ID',
        field: 'measureId',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'numeric-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' }
      },
      {
        headerName: 'Description',
        field: 'description',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' }
      },
      {
        headerName: 'Data Source',
        field: 'dataSource',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' }
      },
      {
        headerName: 'Target Performance',
        field: 'targetPerformance',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' }
      },
      {
        headerName: 'Current Performance',
        field: 'currentPerformance',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' }
      },
      {
        headerName: 'Current Performance Date',
        field: 'currentPerformanceDate',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        cellRendererFramework: DatePickerCellRendererComponent,
        cellEditorFramework: DatePickerCellEditorComponent,
        minWidth: 145
      },
      {
        headerName: 'Actions',
        field: 'action',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellRendererFramework: ActionCellRendererComponent,
        maxWidth: 120
      }
    ];
  }

  setupTeamLeadsGrid() {
    this.teamLeadsColumnDefinitions = [
      {
        headerName: 'Name',
        field: 'name',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' }
      },
      {
        headerName: 'Title/Department',
        field: 'title',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' }
      },
      {
        headerName: 'Role',
        field: 'role',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' }
      },
      {
        headerName: 'Responsibilities',
        field: 'responsibilities',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' }
      },
      {
        headerName: 'Actions',
        field: 'action',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellRendererFramework: ActionCellRendererComponent,
        maxWidth: 120
      }
    ];
  }

  setupProcessPriorizationGrid() {
    this.processPriorizationColumnDefinitions = [
      {
        headerName: 'Potential Processes',
        field: 'potentialProcesses',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' }
      },
      {
        headerName: 'Priority Ranking',
        field: 'priorityRanking',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        cellEditorFramework: DropdownCellRendererComponent,
        cellEditorParams: {
          cellHeight: 50,
          values: this.priorityRankingOptions
        }
      },
      {
        headerName: 'Estimated Completion Date',
        field: 'estimatedCompletionDate',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        cellRendererFramework: DatePickerCellRendererComponent,
        cellEditorFramework: DatePickerCellEditorComponent,
        minWidth: 145,
        maxWidth: 200
      },
      {
        headerName: 'Notes',
        field: 'notes',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' }
      },
      {
        headerName: 'Actions',
        field: 'action',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellRendererFramework: ActionCellRendererComponent,
        maxWidth: 120
      }
    ];
  }

  private saveEvaluationMeasureRow(rowIndex: number) {
    this.evaluationMeasureGridApi.stopEditing();
    const row: any = this.evaluationMeasureRows[rowIndex];
    const canSave = this.validateEvaluationMeasureRowData(row);
    if (canSave) {
      if (row.currentPerformanceDate) {
        row.currentPerformanceDate = moment(row.currentPerformanceDate, 'MM/DD/YYYY');
      }
      if (!row.id) {
        row.containerId = this.ufr.id;
        this.evaluationMeasureService.createEvaluationMeasure(row).subscribe(
          resp => {
            this.busy = false;
            if (row.currentPerformanceDate) {
              row.currentPerformanceDate = row.currentPerformanceDate.format('MM/DD/YYYY');
            }
            // Update view
            this.viewEvaluationMeasureMode(rowIndex);
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
            this.editEvaluationMeasureRow(rowIndex);
          }
        );
      } else {
        // Ensure creation information is preserved
        this.evaluationMeasureService.updateEvaluationMeasure(row).subscribe(
          resp => {
            this.busy = false;
            if (row.currentPerformanceDate) {
              row.currentPerformanceDate = row.currentPerformanceDate.format('MM/DD/YYYY');
            }
            // Update view
            this.viewEvaluationMeasureMode(rowIndex);
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
            this.editEvaluationMeasureRow(rowIndex);
          }
        );
      }
      this.viewEvaluationMeasureMode(rowIndex);
    } else {
      this.editEvaluationMeasureRow(rowIndex);
    }
  }

  private cancelEvaluationMeasureRow(rowIndex: number) {
    this.evaluationMeasureRows[rowIndex] = this.currentEvaluationMeasureRowDataState.currentEditingRowData;
    this.viewEvaluationMeasureMode(rowIndex);
  }

  private editEvaluationMeasureRow(rowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.currentEvaluationMeasureRowDataState.currentEditingRowData = { ...this.evaluationMeasureRows[rowIndex] };
    }
    this.editEvaluationMeasureMode(rowIndex);
  }

  private deleteEvaluationMeasureRow(rowIndex: number) {
    const rowObj = this.evaluationMeasureRows[rowIndex];
    if (rowObj.id) {
      this.evaluationMeasureService.deleteEvaluationMeasure(rowObj.id).subscribe(x => {
        this.busy = false;
      });
    }
    this.evaluationMeasureRows.splice(rowIndex, 1);
    this.evaluationMeasureRows.forEach(row => {
      row.order--;
    });
    this.currentEvaluationMeasureRowDataState.currentEditingRowIndex = 0;
    this.currentEvaluationMeasureRowDataState.isEditMode = false;
    this.currentEvaluationMeasureRowDataState.isAddMode = false;
    this.evaluationMeasureGridApi.stopEditing();
    this.evaluationMeasureRows.forEach(row => {
      row.isDisabled = false;
    });
    this.evaluationMeasureGridApi.setRowData(this.evaluationMeasureRows);
  }

  private viewEvaluationMeasureMode(rowIndex: number) {
    this.currentEvaluationMeasureRowDataState.currentEditingRowIndex = 0;
    this.currentEvaluationMeasureRowDataState.isEditMode = false;
    this.currentEvaluationMeasureRowDataState.isAddMode = false;
    this.evaluationMeasureGridApi.stopEditing();
    this.evaluationMeasureRows[rowIndex].action = {
      ...this.actionState.VIEW,
      dataGrid: ScopeGridName.EVALUATION_MEASURE
    };
    this.evaluationMeasureRows.forEach(row => {
      row.isDisabled = false;
    });
    this.evaluationMeasureGridApi.setRowData(this.evaluationMeasureRows);
  }

  private editEvaluationMeasureMode(rowIndex: number) {
    this.currentEvaluationMeasureRowDataState.currentEditingRowIndex = rowIndex;
    this.currentEvaluationMeasureRowDataState.isEditMode = true;
    this.evaluationMeasureRows[rowIndex].action = {
      ...this.actionState.EDIT,
      dataGrid: ScopeGridName.EVALUATION_MEASURE
    };
    this.evaluationMeasureRows.forEach((row, index) => {
      if (rowIndex !== index) {
        row.isDisabled = true;
      }
    });
    this.evaluationMeasureGridApi.setRowData(this.evaluationMeasureRows);
    this.evaluationMeasureGridApi.startEditingCell({
      rowIndex,
      colKey: 'measureId'
    });
  }

  private validateEvaluationMeasureRowData(row: any) {
    let errorMessage = '';
    if (!row.measureId?.length) {
      errorMessage = 'Measure ID cannot be empty.';
    } else if (!row.description?.length) {
      errorMessage = 'Description cannot be empty.';
    } else if (row.measureId.length > 45) {
      errorMessage = 'Measure ID cannot have more than 45 characters.';
    } else if (row.description?.length > 45) {
      errorMessage = 'Description cannot have more than 45 characters.';
    } else if (row.dataSource?.length > 45) {
      errorMessage = 'Data Source cannot have more than 45 characters.';
    } else if (row.targetPerformance?.length > 45) {
      errorMessage = 'Target Performance cannot have more than 45 characters.';
    } else if (row.currentPerformance?.length > 45) {
      errorMessage = 'Current Performance cannot have more than 45 characters.';
    } else if (
      row.currentPerformanceDate !== null &&
      row.currentPerformanceDate !== '' &&
      !this.validateDate(row.currentPerformanceDate)
    ) {
      errorMessage = 'Make sure Current Performance Date is a valid date in the format (Month/Day/Year).';
    }
    if (errorMessage.length) {
      this.dialogService.displayError(errorMessage);
    }
    return !errorMessage.length;
  }

  onHandleEvaluationMeasureCellAction(cellAction: DataGridMessage) {
    if (cellAction.rowData.dataGrid === ScopeGridName.EVALUATION_MEASURE) {
      switch (cellAction.message) {
        case 'save':
          this.saveEvaluationMeasureRow(cellAction.rowIndex);
          break;
        case 'edit':
          if (!this.currentEvaluationMeasureRowDataState.isEditMode) {
            this.editEvaluationMeasureRow(cellAction.rowIndex, true);
          }
          break;
        case 'delete-row':
          if (!this.currentEvaluationMeasureRowDataState.isEditMode) {
            this.deleteDialog.bodyText =
              'You will be permanently deleting the row from the grid.  Are you sure you want to delete this row?';
            this.displayDeleteDialog(cellAction, this.deleteEvaluationMeasureRow.bind(this));
          }
          break;
        case 'cancel':
          if (
            this.currentEvaluationMeasureRowDataState.isEditMode &&
            !this.currentEvaluationMeasureRowDataState.isAddMode
          ) {
            this.cancelEvaluationMeasureRow(cellAction.rowIndex);
          } else {
            this.deleteEvaluationMeasureRow(cellAction.rowIndex);
          }
          break;
      }
    }
  }

  private saveTeamLeadRow(rowIndex: number) {
    this.teamLeadGridApi.stopEditing();
    const row: any = this.teamLeadRows[rowIndex];
    const canSave = this.validateTeamLeadRowData(row);
    if (canSave) {
      if (!row.id) {
        row.containerId = this.ufr.id;
        this.teamLeadService.createTeamLead(row).subscribe(
          resp => {
            this.busy = false;

            // Update view
            this.viewTeamLeadMode(rowIndex);
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
            this.editTeamLeadRow(rowIndex);
          }
        );
      } else {
        // Ensure creation information is preserved
        this.teamLeadService.updateTeamLead(row).subscribe(
          resp => {
            this.busy = false;
            // Update view
            this.viewTeamLeadMode(rowIndex);
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
            this.editTeamLeadRow(rowIndex);
          }
        );
      }
      this.viewTeamLeadMode(rowIndex);
    } else {
      this.editTeamLeadRow(rowIndex);
    }
  }

  private cancelTeamLeadRow(rowIndex: number) {
    this.teamLeadRows[rowIndex] = this.currentTeamLeadRowDataState.currentEditingRowData;
    this.viewTeamLeadMode(rowIndex);
  }

  private editTeamLeadRow(rowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.currentTeamLeadRowDataState.currentEditingRowData = { ...this.teamLeadRows[rowIndex] };
    }
    this.editTeamLeadMode(rowIndex);
  }

  private deleteTeamLeadRow(rowIndex: number) {
    const rowObj = this.teamLeadRows[rowIndex];
    if (rowObj.id) {
      this.teamLeadService.deleteTeamLead(rowObj.id).subscribe(x => {
        this.busy = false;
      });
    }
    this.teamLeadRows.splice(rowIndex, 1);
    this.teamLeadRows.forEach(row => {
      row.order--;
    });
    this.currentTeamLeadRowDataState.currentEditingRowIndex = 0;
    this.currentTeamLeadRowDataState.isEditMode = false;
    this.currentTeamLeadRowDataState.isAddMode = false;
    this.teamLeadGridApi.stopEditing();
    this.teamLeadRows.forEach(row => {
      row.isDisabled = false;
    });
    this.teamLeadGridApi.setRowData(this.teamLeadRows);
  }

  private viewTeamLeadMode(rowIndex: number) {
    this.currentTeamLeadRowDataState.currentEditingRowIndex = 0;
    this.currentTeamLeadRowDataState.isEditMode = false;
    this.currentTeamLeadRowDataState.isAddMode = false;
    this.teamLeadGridApi.stopEditing();
    this.teamLeadRows[rowIndex].action = {
      ...this.actionState.VIEW,
      dataGrid: ScopeGridName.TEAM_LEAD
    };
    this.teamLeadRows.forEach(row => {
      row.isDisabled = false;
    });
    this.teamLeadGridApi.setRowData(this.teamLeadRows);
  }

  private editTeamLeadMode(rowIndex: number) {
    this.currentTeamLeadRowDataState.currentEditingRowIndex = rowIndex;
    this.currentTeamLeadRowDataState.isEditMode = true;
    this.teamLeadRows[rowIndex].action = {
      ...this.actionState.EDIT,
      dataGrid: ScopeGridName.TEAM_LEAD
    };
    this.teamLeadRows.forEach((row, index) => {
      if (rowIndex !== index) {
        row.isDisabled = true;
      }
    });
    this.teamLeadGridApi.setRowData(this.teamLeadRows);
    this.teamLeadGridApi.startEditingCell({
      rowIndex,
      colKey: 'name'
    });
  }

  private validateTeamLeadRowData(row: any) {
    let errorMessage = '';
    if (!row.name?.length) {
      errorMessage = 'Name cannot be empty.';
    } else if (row.name.length > 45) {
      errorMessage = 'Name cannot have more than 45 characters.';
    } else if (row.title?.length > 45) {
      errorMessage = 'Title/Department cannot have more than 45 characters.';
    } else if (row.role?.length > 45) {
      errorMessage = 'Role cannot have more than 45 characters.';
    } else if (row.responsibilities?.length > 45) {
      errorMessage = 'Responsibilities cannot have more than 45 characters.';
    }
    if (errorMessage.length) {
      this.dialogService.displayError(errorMessage);
    }
    return !errorMessage.length;
  }

  onHandleTeamLeadCellAction(cellAction: DataGridMessage) {
    if (cellAction.rowData.dataGrid === ScopeGridName.TEAM_LEAD) {
      switch (cellAction.message) {
        case 'save':
          this.saveTeamLeadRow(cellAction.rowIndex);
          break;
        case 'edit':
          if (!this.currentTeamLeadRowDataState.isEditMode) {
            this.editTeamLeadRow(cellAction.rowIndex, true);
          }
          break;
        case 'delete-row':
          if (!this.currentTeamLeadRowDataState.isEditMode) {
            this.deleteDialog.bodyText =
              'You will be permanently deleting the row from the grid.  Are you sure you want to delete this row?';
            this.displayDeleteDialog(cellAction, this.deleteTeamLeadRow.bind(this));
          }
          break;
        case 'cancel':
          if (this.currentTeamLeadRowDataState.isEditMode && !this.currentTeamLeadRowDataState.isAddMode) {
            this.cancelTeamLeadRow(cellAction.rowIndex);
          } else {
            this.deleteTeamLeadRow(cellAction.rowIndex);
          }
          break;
      }
    }
  }

  private saveProcessPriorizationRow(rowIndex: number) {
    this.processPriorizationGridApi.stopEditing();
    const row: any = this.processPriorizationRows[rowIndex];
    const canSave = this.validateProcessPriorizationRowData(row);
    if (canSave) {
      if (row.estimatedCompletionDate) {
        row.estimatedCompletionDate = moment(row.estimatedCompletionDate, 'MM/DD/YYYY');
      }
      if (!row.id) {
        row.containerId = this.ufr.id;
        this.processPrioritizationService.createProcessPrioritization(row).subscribe(
          resp => {
            this.busy = false;

            if (row.estimatedCompletionDate) {
              row.estimatedCompletionDate = row.estimatedCompletionDate.format('MM/DD/YYYY');
            }
            // Update view
            this.viewProcessPriorizationMode(rowIndex);
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
            this.editProcessPriorizationRow(rowIndex);
          }
        );
      } else {
        // Ensure creation information is preserved
        this.processPrioritizationService.updateProcessPrioritization(row).subscribe(
          resp => {
            this.busy = false;

            if (row.estimatedCompletionDate) {
              row.estimatedCompletionDate = row.estimatedCompletionDate.format('MM/DD/YYYY');
            }
            // Update view
            this.viewProcessPriorizationMode(rowIndex);
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
            this.editProcessPriorizationRow(rowIndex);
          }
        );
      }
      this.viewProcessPriorizationMode(rowIndex);
    } else {
      this.editProcessPriorizationRow(rowIndex);
    }
  }

  private cancelProcessPriorizationRow(rowIndex: number) {
    this.processPriorizationRows[rowIndex] = this.currentProcessPriorizationRowDataState.currentEditingRowData;
    this.viewProcessPriorizationMode(rowIndex);
  }

  private editProcessPriorizationRow(rowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.currentProcessPriorizationRowDataState.currentEditingRowData = { ...this.processPriorizationRows[rowIndex] };
    }
    this.editProcessPriorizationMode(rowIndex);
  }

  private deleteProcessPriorizationRow(rowIndex: number) {
    const rowObj = this.processPriorizationRows[rowIndex];
    if (rowObj.id) {
      this.processPrioritizationService.deleteProcessPrioritization(rowObj.id).subscribe(x => {
        this.busy = false;
      });
    }
    this.processPriorizationRows.splice(rowIndex, 1);
    this.processPriorizationRows.forEach(row => {
      row.order--;
    });
    this.currentProcessPriorizationRowDataState.currentEditingRowIndex = 0;
    this.currentProcessPriorizationRowDataState.isEditMode = false;
    this.currentProcessPriorizationRowDataState.isAddMode = false;
    this.processPriorizationGridApi.stopEditing();
    this.processPriorizationRows.forEach(row => {
      row.isDisabled = false;
    });
    this.processPriorizationGridApi.setRowData(this.processPriorizationRows);
  }

  private viewProcessPriorizationMode(rowIndex: number) {
    this.currentProcessPriorizationRowDataState.currentEditingRowIndex = 0;
    this.currentProcessPriorizationRowDataState.isEditMode = false;
    this.currentProcessPriorizationRowDataState.isAddMode = false;
    this.processPriorizationGridApi.stopEditing();
    this.processPriorizationRows[rowIndex].action = {
      ...this.actionState.VIEW,
      dataGrid: ScopeGridName.PROCESS_PRIORIZATION
    };
    this.processPriorizationRows.forEach(row => {
      row.isDisabled = false;
    });
    this.processPriorizationGridApi.setRowData(this.processPriorizationRows);
  }

  private editProcessPriorizationMode(rowIndex: number) {
    this.currentProcessPriorizationRowDataState.currentEditingRowIndex = rowIndex;
    this.currentProcessPriorizationRowDataState.isEditMode = true;
    this.processPriorizationRows[rowIndex].action = {
      ...this.actionState.EDIT,
      dataGrid: ScopeGridName.PROCESS_PRIORIZATION
    };
    this.processPriorizationRows.forEach((row, index) => {
      if (rowIndex !== index) {
        row.isDisabled = true;
      }
    });
    this.processPriorizationGridApi.setRowData(this.processPriorizationRows);
    this.processPriorizationGridApi.startEditingCell({
      rowIndex,
      colKey: 'potentialProcesses'
    });
  }

  private validateProcessPriorizationRowData(row: any) {
    let errorMessage = '';
    if (!row.potentialProcesses?.length) {
      errorMessage = 'Potential Process cannot be empty.';
    } else if (row.potentialProcesses.length > 45) {
      errorMessage = 'Potential Process have more than 45 characters.';
    } else if (row.notes?.length > 500) {
      errorMessage = 'Notes cannot have more than 500 characters.';
    } else if (
      row.estimatedCompletionDate !== null &&
      row.estimatedCompletionDate !== '' &&
      !this.validateDate(row.estimatedCompletionDate)
    ) {
      errorMessage = 'Make sure Estimated Completion Date is a valid date in the format (Month/Day/Year).';
    }
    if (errorMessage.length) {
      this.dialogService.displayError(errorMessage);
    }
    return !errorMessage.length;
  }

  onHandleProcessPriorizationCellAction(cellAction: DataGridMessage) {
    if (cellAction.rowData.dataGrid === ScopeGridName.PROCESS_PRIORIZATION) {
      switch (cellAction.message) {
        case 'save':
          this.saveProcessPriorizationRow(cellAction.rowIndex);
          break;
        case 'edit':
          if (!this.currentProcessPriorizationRowDataState.isEditMode) {
            this.editProcessPriorizationRow(cellAction.rowIndex, true);
          }
          break;
        case 'delete-row':
          if (!this.currentProcessPriorizationRowDataState.isEditMode) {
            this.deleteDialog.bodyText =
              'You will be permanently deleting the row from the grid.  Are you sure you want to delete this row?';
            this.displayDeleteDialog(cellAction, this.deleteProcessPriorizationRow.bind(this));
          }
          break;
        case 'cancel':
          if (
            this.currentProcessPriorizationRowDataState.isEditMode &&
            !this.currentProcessPriorizationRowDataState.isAddMode
          ) {
            this.cancelProcessPriorizationRow(cellAction.rowIndex);
          } else {
            this.deleteProcessPriorizationRow(cellAction.rowIndex);
          }
          break;
      }
    }
  }

  private validateDate(dateString: string) {
    if (dateString) {
      try {
        const date = new Date(dateString);
        const dateSplit = dateString.split('/');
        if (
          date.getFullYear() === Number(dateSplit[2]) &&
          date.getMonth() === Number(dateSplit[0]) - 1 &&
          date.getDate() === Number(dateSplit[1])
        ) {
          return true;
        }
      } catch (err) {
        return false;
      }
    }
    return false;
  }

  onEvaluationMeasureMouseDown(event: MouseEvent) {
    if (this.currentEvaluationMeasureRowDataState.isEditMode) {
      this.evaluationMeasureGridApi.startEditingCell({
        rowIndex: this.currentEvaluationMeasureRowDataState.currentEditingRowIndex,
        colKey: 'id'
      });
    }
  }

  onTeamLeadMouseDown(event: MouseEvent) {
    if (this.currentTeamLeadRowDataState.isEditMode) {
      this.teamLeadGridApi.startEditingCell({
        rowIndex: this.currentTeamLeadRowDataState.currentEditingRowIndex,
        colKey: 'name'
      });
    }
  }

  onProcessPriorizationMouseDown(event: MouseEvent) {
    if (this.currentProcessPriorizationRowDataState.isEditMode) {
      this.processPriorizationGridApi.startEditingCell({
        rowIndex: this.currentProcessPriorizationRowDataState.currentEditingRowIndex,
        colKey: 'potentialProcesses'
      });
    }
  }

  onEvaluationMeasureRowAdd(event: any) {
    if (this.currentEvaluationMeasureRowDataState.isEditMode) {
      return;
    }
    this.evaluationMeasureRows.push({
      measureId: '',
      description: '',
      dataSource: '',
      targetPerformance: '',
      currentPerformance: '',
      currentPerformanceDate: null,
      action: { ...this.actionState.EDIT, dataGrid: ScopeGridName.EVALUATION_MEASURE }
    });
    this.currentEvaluationMeasureRowDataState.isAddMode = true;
    this.evaluationMeasureGridApi.setRowData(this.evaluationMeasureRows);
    this.editEvaluationMeasureRow(this.evaluationMeasureRows.length - 1);
  }

  onTeamLeadRowAdd(event: any) {
    if (this.currentTeamLeadRowDataState.isEditMode) {
      return;
    }
    this.teamLeadRows.push({
      name: '',
      title: '',
      role: '',
      responsibilities: '',
      action: { ...this.actionState.EDIT, dataGrid: ScopeGridName.TEAM_LEAD }
    });
    this.currentTeamLeadRowDataState.isAddMode = true;
    this.teamLeadGridApi.setRowData(this.teamLeadRows);
    this.editTeamLeadRow(this.teamLeadRows.length - 1);
  }

  onProcessPriorizationRowAdd(event: any) {
    if (this.currentProcessPriorizationRowDataState.isEditMode) {
      return;
    }
    this.processPriorizationRows.push({
      potentialProcesses: '',
      priorityRanking: '',
      estimatedCompletionDate: null,
      notes: '',
      action: { ...this.actionState.EDIT, dataGrid: ScopeGridName.PROCESS_PRIORIZATION }
    });
    this.currentProcessPriorizationRowDataState.isAddMode = true;
    this.processPriorizationGridApi.setRowData(this.processPriorizationRows);
    this.editProcessPriorizationRow(this.processPriorizationRows.length - 1);
  }

  onEvaluationMeasureGridIsReady(gridApi: GridApi) {
    this.evaluationMeasureGridApi = gridApi;
    this.evaluationMeasureGridApi.setRowData([]);
    this.loadEvaluationMeasures();
  }

  onTeamLeadGridIsReady(gridApi: GridApi) {
    this.teamLeadGridApi = gridApi;
    this.teamLeadGridApi.setRowData([]);
    this.loadTeamLeads();
  }

  onProcessPriorizationGridIsReady(gridApi: GridApi) {
    this.processPriorizationGridApi = gridApi;
    this.processPriorizationGridApi.setRowData([]);
    this.loadProcessPrioritizations();
  }

  handleNewAttachments(newFile: FileMetaData) {
    this.showUploadDialog = false;
    if (newFile) {
      const attachment = new Attachment();
      attachment.file = newFile;
      this.programAttachments.push(attachment);
      this.attachmentsUploaded.push({
        id: attachment.file.id,
        isSelected: false,
        name: attachment.file.name,
        value: attachment.file.id,
        rawData: attachment
      });
    }
  }

  onFileUploadClick() {
    this.showUploadDialog = true;
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

  changeEditMode(editMode: boolean) {
    this.editMode = editMode;
    this.actionState.EDIT.editMode = editMode;
    this.actionState.VIEW.editMode = editMode;

    if (editMode) {
      this.form.get('aim').enable();
      this.form.get('goal').enable();
      this.form.get('quality').enable();
      this.form.get('other').enable();
    } else {
      this.form.get('aim').disable();
      this.form.get('goal').disable();
      this.form.get('quality').disable();
      this.form.get('other').disable();
    }
    this.evaluationMeasureRows.forEach(row => {
      row.action.editMode = editMode;
    });
    if (this.evaluationMeasureGridApi) {
      this.evaluationMeasureGridApi.setRowData(this.evaluationMeasureRows);
    }

    this.teamLeadRows.forEach(row => {
      row.action.editMode = editMode;
    });
    if (this.teamLeadGridApi) {
      this.teamLeadGridApi.setRowData(this.evaluationMeasureRows);
    }

    this.processPriorizationRows.forEach(row => {
      row.action.editMode = editMode;
    });
    if (this.processPriorizationGridApi) {
      this.processPriorizationGridApi.setRowData(this.processPriorizationRows);
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

export enum ScopeGridName {
  EVALUATION_MEASURE = 'evaluation-measure',
  TEAM_LEAD = 'team-lead',
  PROCESS_PRIORIZATION = 'process-priorization'
}
