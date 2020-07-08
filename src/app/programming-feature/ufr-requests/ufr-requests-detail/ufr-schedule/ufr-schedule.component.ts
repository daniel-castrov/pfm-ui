import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ColDef, GridApi } from '@ag-grid-community/all-modules';
import { formatDate } from '@angular/common';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';
import { Action } from 'src/app/pfm-common-models/Action';
import { ActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { GoogleChartInterface } from 'ng2-google-charts/ng2-google-charts';
import { GoogleChartComponent } from 'ng2-google-charts';
import { DatePickerCellEditorComponent } from 'src/app/pfm-coreui/datagrid/renderers/date-picker-cell-editor/date-picker-cell-editor.component';
import { DatePickerCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/date-picker-cell-renderer/date-picker-cell-renderer.component';
import { ListItem } from 'src/app/pfm-common-models/ListItem';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { FundingLineService } from '../../../services/funding-line.service';
import { map } from 'rxjs/operators';
import { FundingLine } from '../../../models/funding-line.model';
import { ScheduleService } from '../../../services/schedule.service';
import * as moment from 'moment';
import { Schedule } from '../../../models/schedule.model';
import { DropdownCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/dropdown-cell-renderer/dropdown-cell-renderer.component';
import { UFR } from 'src/app/programming-feature/models/ufr.model';
import { FundingLineType } from 'src/app/programming-feature/models/enumerations/funding-line-type.model';
import { UFRStatus } from '../../../models/enumerations/ufr-status.model';

@Component({
  selector: 'pfm-ufr-schedule',
  templateUrl: './ufr-schedule.component.html',
  styleUrls: ['./ufr-schedule.component.scss']
})
export class UfrScheduleComponent implements OnInit {
  @Input() ufr: UFR;
  @Input() pomYear: number;

  currentFiscalYear: number;

  @ViewChild('googleChart')
  chart: GoogleChartComponent;

  fundingGridActionState = {
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

  fundingFilter: ListItem[] = [];

  selectedFundingFilter = 'Show All';

  fundingGridAssociations = [];

  chartData: GoogleChartInterface = {
    chartType: 'Gantt',
    options: {
      width: 1000,
      height: 655,
      gantt: {
        trackHeight: 40,
        innerGridHorizLine: {
          strokeWidth: 1
        },
        arrow: {
          width: 0,
          color: '#FFF',
          radius: 0
        },
        criticalPathEnabled: false
      }
    }
  };

  gridApi: GridApi;
  components: any;
  fundingGridColumnDefinitions: ColDef[] = [];
  schedulesData: ScheduleDataInterface[] = [];
  scheduleGridRows: ScheduleDataInterface[] = [];

  busy: boolean;
  currentRowDataState: ScheduleRowDataStateInterface = {};
  pageEditMode: boolean;

  constructor(
    private dialogService: DialogService,
    private fundingLineService: FundingLineService,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit() {
    this.loadFundingLines();
    this.loadSchedulesGrid();
    this.currentFiscalYear = this.pomYear;
    this.pageEditMode = history.state.editMode;
    this.changePageEditMode(this.pageEditMode);
  }

  loadFundingLines() {
    this.fundingFilter = [
      {
        id: 'Show All',
        name: 'Show All',
        value: 'Show All',
        isSelected: true,
        rawData: 'Show All'
      },
      {
        id: 'None',
        name: 'No funding line association',
        value: 'None',
        isSelected: false,
        rawData: 'None'
      }
    ];
    this.fundingGridAssociations = [];
    this.scheduleGridRows = [];
    this.fundingLineService
      .obtainFundingLinesByContainerId(this.ufr.id, FundingLineType.UFR_PROPOSED)
      .pipe(
        map(resp => {
          const fundingLines = resp.result as FundingLine[];
          return fundingLines.map(fundingLine => {
            const appn = fundingLine.appropriation ? fundingLine.appropriation : '';
            const baOrBlin = fundingLine.baOrBlin ? fundingLine.baOrBlin : '';
            const sag = fundingLine.sag ? fundingLine.sag : '';
            const wucd = fundingLine.wucd ? fundingLine.wucd : '';
            const expType = fundingLine.expenditureType ? fundingLine.expenditureType : '';
            return {
              id: fundingLine.id,
              value: [appn, baOrBlin, sag, wucd, expType].join('/')
            };
          });
        }),
        map(objs => {
          return objs.map(obj => {
            return { id: obj.id, name: obj.value, value: obj.id, isSelected: false, rawData: obj.value };
          });
        })
      )
      .subscribe(
        fundingLines => {
          for (const fundingLine of fundingLines) {
            this.fundingFilter.push(fundingLine);
            this.fundingGridAssociations.push(fundingLine);
          }
        },
        error => null,
        () => {
          this.loadSchedules();
        }
      );
  }

  private loadSchedules() {
    this.schedulesData = [];
    this.scheduleService.getByContainerId(this.ufr.id).subscribe(schResp => {
      const schedules = (schResp as any).result;
      for (const schedule of schedules) {
        if (schedule.startDate) {
          schedule.startDate = schedule.startDate.format('MM/DD/YYYY');
        }
        if (schedule.endDate) {
          schedule.endDate = schedule.endDate.format('MM/DD/YYYY');
        }
        this.schedulesData.push(schedule);
      }
      this.schedulesData.sort((a, b) => a.order - b.order);
      this.scheduleGridRows = [...this.schedulesData];
      for (let i = 0; i < this.scheduleGridRows.length; i++) {
        this.viewMode(i);
      }
      if (this.gridApi) {
        this.gridApi.setRowData(this.scheduleGridRows);
      }
      this.drawGanttChart(true);
    });
  }

  onScheduleRowAdd(event: any) {
    if (this.currentRowDataState.isEditMode || !this.currentFiscalYear) {
      return;
    }
    const maxOrder = this.schedulesData.length
      ? Math.max.apply(
          Math,
          this.schedulesData.map(row => row.order)
        )
      : 0;
    this.scheduleGridRows.push({
      taskDescription: '',
      fundingLineId:
        this.selectedFundingFilter.toLowerCase() !== 'none' && this.selectedFundingFilter.toLowerCase() !== 'show all'
          ? this.selectedFundingFilter
          : '',
      startDate: formatDate(new Date(this.currentFiscalYear + '-01-01 00:00:00'), 'MM/dd/yyyy', 'en-US'),
      endDate: formatDate(new Date(this.currentFiscalYear + 4 + '-12-31  00:00:00'), 'MM/dd/yyyy', 'en-US'),
      order: maxOrder + 1,
      action: this.fundingGridActionState.EDIT
    });
    this.currentRowDataState.isAddMode = true;
    this.gridApi.setRowData(this.scheduleGridRows);
    this.editRow(this.scheduleGridRows.length - 1);
  }

  drawGanttChart(redraw?: boolean) {
    if (!this.currentFiscalYear) {
      return;
    }
    const data: any[] = [
      ['Task ID', 'Task Name', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']
    ];
    data.push([
      '0',
      '',
      new Date(this.currentFiscalYear + '-01-01 00:00:00'),
      new Date(this.currentFiscalYear + 4 + '-12-31 00:00:00'),
      0,
      100,
      null
    ]);
    if (this.selectedFundingFilter.toLowerCase() === 'none') {
      this.scheduleGridRows
        .filter((row, index) => !row.fundingLineId)
        .forEach(row => {
          data.push([row.id + '', '', new Date(row.startDate), new Date(row.endDate), 0, 100, '0']);
        });
    } else if (this.selectedFundingFilter.toLowerCase() !== 'show all') {
      this.scheduleGridRows
        .filter((row, index) => row.fundingLineId === this.selectedFundingFilter)
        .forEach(row => {
          data.push([row.id + '', '', new Date(row.startDate), new Date(row.endDate), 0, 100, '0']);
        });
    } else {
      this.scheduleGridRows.forEach(row => {
        data.push([row.id + '', '', new Date(row.startDate), new Date(row.endDate), 0, 100, '0']);
      });
    }
    if (data.length === 1) {
      data.push([
        '',
        '',
        new Date(new Date().getFullYear(), 0, 1),
        new Date(new Date().getFullYear(), 0, 1),
        0,
        100,
        ''
      ]);
    }

    this.chartData.dataTable = data;
    if (this.chart || redraw) {
      if (this.chart.wrapper) {
        this.chart.draw();
      }
    }
  }

  drawTitleOnTop() {
    const scheduleGanttChartChart = document
      .getElementsByClassName('gantt-chart-container')[0]
      .getElementsByTagName('google-chart')[0];
    const g = scheduleGanttChartChart.getElementsByTagName('svg')[0].getElementsByTagName('g')[1];
    scheduleGanttChartChart.getElementsByTagName('svg')[0].parentElement.style.top = '40px';
    scheduleGanttChartChart.getElementsByTagName('svg')[0].style.overflow = 'visible';
    const height = Number(g.getElementsByTagName('text')[0].getAttribute('y')) + 19;
    g.setAttribute('transform', 'translate(0,-' + height + ')');
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    if (this.chart) {
      this.chart.draw();
    }
  }

  onChartReady(event: any) {
    this.drawTitleOnTop();
  }

  onGridIsReady(gridApi: GridApi) {
    this.gridApi = gridApi;
    if (this.chart) {
      this.drawGanttChart(true);
    }
  }

  private loadSchedulesGrid() {
    this.loadFundColumns();
  }

  private loadFundColumns() {
    this.fundingGridColumnDefinitions.push(
      {
        headerName: 'ID',
        field: 'order',
        editable: false,
        suppressMovable: true,
        maxWidth: 60,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'numeric-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' }
      },
      {
        headerName: 'Task Description',
        field: 'taskDescription',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
      },
      {
        headerName: 'Funding Line Association',
        field: 'fundingLineId',
        editable: params => {
          return this.selectedFundingFilter.toLowerCase() === 'show all';
        },
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' },
        cellEditorFramework: DropdownCellRendererComponent,
        valueFormatter: params => {
          if (params.value) {
            const find = this.fundingGridAssociations.find(x => x.id === params.value);
            if (find) {
              return find.name;
            } else {
              return params.value;
            }
          }
          return null;
        },
        cellEditorParams: params => {
          return {
            cellHeight: 50,
            values: [
              ...this.fundingGridAssociations.map(x => {
                return [x.name, x.value];
              })
            ]
          };
        }
      },
      {
        headerName: 'Start Date',
        field: 'startDate',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' },
        cellRendererFramework: DatePickerCellRendererComponent,
        cellEditorFramework: DatePickerCellEditorComponent,
        minWidth: 145
      },
      {
        headerName: 'End Date',
        field: 'endDate',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' },
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
    );
  }

  onFilterSelection(item: ListItem) {
    if (item && item.value) {
      this.selectedFundingFilter = item.value;
      this.filterRows();
    }
  }

  filterRows() {
    if (this.selectedFundingFilter.toLowerCase() === 'show all') {
      this.scheduleGridRows = [...this.schedulesData];
    } else if (this.selectedFundingFilter.toLowerCase() === 'none') {
      this.scheduleGridRows = this.schedulesData.filter((row, index) => !row.fundingLineId);
    } else {
      this.scheduleGridRows = this.schedulesData.filter(
        (row, index) => row.fundingLineId === this.selectedFundingFilter
      );
    }

    this.gridApi.setRowData(this.scheduleGridRows);

    this.drawGanttChart(true);
    return this.scheduleGridRows;
  }

  onMouseDown(event: MouseEvent) {
    if (this.currentRowDataState.isEditMode) {
      this.gridApi.startEditingCell({
        rowIndex: this.currentRowDataState.currentEditingRowIndex,
        colKey: 'taskDescription'
      });
    }
  }

  handleCellAction(cellAction: DataGridMessage) {
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
    this.gridApi.stopEditing();
    const row: ScheduleDataInterface = this.scheduleGridRows[rowIndex];
    const canSave = this.validateRowData(row);
    if (canSave) {
      row.containerId = this.ufr.id;
      if (row.startDate) {
        row.startDate = moment(row.startDate, 'MM/DD/YYYY');
      }
      if (row.endDate) {
        row.endDate = moment(row.endDate, 'MM/DD/YYYY');
      }
      if (!row.id) {
        this.scheduleService.createUfrSchedule(row).subscribe(
          resp => {
            const dbSchedule = resp.result as Schedule;
            row.id = dbSchedule.id;
            if (row.startDate) {
              row.startDate = row.startDate.format('MM/DD/YYYY');
            }
            if (row.endDate) {
              row.endDate = row.endDate.format('MM/DD/YYYY');
            }
            // Update view
            this.viewMode(rowIndex);
            this.updateGanttChart();
            this.schedulesData.push(row);
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
            this.editRow(rowIndex);
          }
        );
      } else {
        // Ensure creation information is preserved
        this.scheduleService.updateUfrSchedule(row).subscribe(
          resp => {
            this.busy = false;
            if (row.startDate) {
              row.startDate = row.startDate.format('MM/DD/YYYY');
            }
            if (row.endDate) {
              row.endDate = row.endDate.format('MM/DD/YYYY');
            }
            // Update view
            this.viewMode(rowIndex);
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
            this.editRow(rowIndex);
          }
        );
      }
      this.busy = true;
      this.viewMode(rowIndex);
      this.updateGanttChart();
    } else {
      this.editRow(rowIndex);
    }
    this.busy = false;
  }

  private validateRowData(row: ScheduleDataInterface) {
    if (!this.currentFiscalYear) {
      return;
    }
    let errorMessage = '';
    if (!row.taskDescription?.length) {
      errorMessage = 'Task Description cannot be empty.';
    } else if (row.taskDescription.length > 45) {
      errorMessage = 'Task Description cannot have more than 45 characters.';
    } else if (!this.validateDate(row.startDate)) {
      errorMessage = 'Make sure Start Date is a valid date in the format (Month/Day/Year).';
    } else if (!this.validateDate(row.endDate)) {
      errorMessage = 'Make sure End Date is a valid date in the format (Month/Day/Year).';
    } else if (new Date(row.startDate) > new Date(row.endDate)) {
      errorMessage = 'Start Date cannot be greater than End Date.';
    } else if (
      new Date(row.startDate).getFullYear() < this.currentFiscalYear ||
      new Date(row.endDate).getFullYear() > this.currentFiscalYear + 4
    ) {
      errorMessage =
        'Start Date cannot be less than the current fiscal year (' +
        this.currentFiscalYear +
        ') and End Date cannot greater than ' +
        (this.currentFiscalYear + 4) +
        '.';
    }
    if (errorMessage.length) {
      this.dialogService.displayError(errorMessage);
    }
    return !errorMessage.length;
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

  private cancelRow(rowIndex: number) {
    this.scheduleGridRows[rowIndex] = this.currentRowDataState.currentEditingRowData;
    this.viewMode(rowIndex);
    this.updateGanttChart();
  }

  private editRow(rowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.currentRowDataState.currentEditingRowData = { ...this.scheduleGridRows[rowIndex] };
    }
    this.editMode(rowIndex);
  }

  private updateGanttChart() {
    this.busy = true;
    this.drawGanttChart(true);
    this.busy = false;
  }

  private deleteRow(rowIndex: number) {
    this.busy = true;
    const rowObj = this.scheduleGridRows[rowIndex];
    if (rowObj.id) {
      this.scheduleService.deleteSchedule(rowObj.id).subscribe(
        x => {
          this.busy = false;
        },
        error => null,
        () => (this.schedulesData = this.schedulesData.filter(x => x.id !== rowObj.id))
      );
    }
    this.scheduleGridRows.splice(rowIndex, 1);
    this.currentRowDataState.currentEditingRowIndex = 0;
    this.currentRowDataState.isEditMode = false;
    this.currentRowDataState.isAddMode = false;
    this.gridApi.stopEditing();
    this.scheduleGridRows.forEach(row => {
      row.isDisabled = false;
    });
    this.gridApi.setRowData(this.scheduleGridRows);
    this.updateGanttChart();
  }

  private viewMode(rowIndex: number) {
    this.currentRowDataState.currentEditingRowIndex = 0;
    this.currentRowDataState.isEditMode = false;
    this.currentRowDataState.isAddMode = false;
    this.scheduleGridRows[rowIndex].action = this.fundingGridActionState.VIEW;
    this.scheduleGridRows.forEach(row => {
      row.isDisabled = false;
    });
    if (this.gridApi) {
      this.gridApi.stopEditing();
      this.gridApi.setRowData(this.scheduleGridRows);
    }
  }

  private editMode(rowIndex: number) {
    this.currentRowDataState.currentEditingRowIndex = rowIndex;
    this.currentRowDataState.isEditMode = true;
    this.scheduleGridRows[rowIndex].action = this.fundingGridActionState.EDIT;
    this.scheduleGridRows.forEach((row, index) => {
      if (rowIndex !== index) {
        row.isDisabled = true;
      }
    });
    this.gridApi.setRowData(this.scheduleGridRows);
    this.gridApi.startEditingCell({
      rowIndex,
      colKey: 'taskDescription'
    });
  }

  changePageEditMode(editMode: boolean) {
    this.pageEditMode = editMode && this.ufr.ufrStatus === UFRStatus.SAVED;
    this.fundingGridActionState.VIEW.editMode = editMode && this.ufr.ufrStatus === UFRStatus.SAVED;
    this.fundingGridActionState.EDIT.editMode = editMode && this.ufr.ufrStatus === UFRStatus.SAVED;
    this.scheduleGridRows.forEach((row, index) => {
      row.action.editMode = editMode && this.ufr.ufrStatus === UFRStatus.SAVED;
    });
  }
}

export interface ScheduleDataInterface {
  id?: string;
  containerId?: string;
  taskDescription?: string;
  fundingLineId?: string;
  startDate?: any;
  endDate?: any;
  order?: number;
  action?: Action;
  isDisabled?: boolean;
}

export interface ScheduleRowDataStateInterface {
  currentEditingRowIndex?: number;
  isAddMode?: boolean;
  isEditMode?: boolean;
  currentEditingRowData?: ScheduleDataInterface;
}
