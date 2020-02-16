import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { ColDef, GridApi } from '@ag-grid-community/all-modules';
import { formatDate } from '@angular/common';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';
import { Action } from 'src/app/pfm-common-models/Action';
import { ActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { GoogleChartComponent } from 'ng2-google-charts';
import { DatePickerCellEditorComponent } from 'src/app/pfm-coreui/datagrid/renderers/date-picker-cell-editor/date-picker-cell-editor.component';
import { DatePickerCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/date-picker-cell-renderer/date-picker-cell-renderer.component';
import { ListItem } from 'src/app/pfm-common-models/ListItem';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';

@Component({
  selector: 'pfm-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

  @ViewChild('googleChart', { static: false })
  chart: GoogleChartComponent;

  currentFiscalYear = 2019;

  fundingGridActionState = {
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

  fundingFilter: ListItem[] = [
    { id: 'Show All', name: 'Show All', value: 'Show All', isSelected: true, rawData: 'Show All' },
    { id: 'AAS/BA4/DE1', name: 'AAS/BA4/DE1', value: 'AAS/BA4/DE1', isSelected: false, rawData: 'AAS/BA4/DE1' },
    { id: 'AAS/BA4/DE2', name: 'AAS/BA4/DE2', value: 'AAS/BA4/DE2', isSelected: false, rawData: 'AAS/BA4/DE2' },
    { id: 'AAS/BA4/DE3', name: 'AAS/BA4/DE3', value: 'AAS/BA4/DE3', isSelected: false, rawData: 'AAS/BA4/DE3' },
    { id: 'APT/BZ2/DE4', name: 'APT/BZ2/DE4', value: 'APT/BZ2/DE4', isSelected: false, rawData: 'APT/BZ2/DE4' },
    { id: 'AAS/BA4/DE5', name: 'AAS/BA4/DE5', value: 'AAS/BA4/DE5', isSelected: false, rawData: 'AAS/BA4/DE5' },
    { id: 'ATT/BA9/DE6', name: 'ATT/BA9/DE6', value: 'ATT/BA9/DE6', isSelected: false, rawData: 'ATT/BA9/DE6' },
    { id: 'AAS/BC4/DE7', name: 'AAS/BC4/DE7', value: 'AAS/BC4/DE7', isSelected: false, rawData: 'AAS/BC4/DE7' },
    { id: 'AAS/BA9/DE8', name: 'AAS/BA9/DE8', value: 'AAS/BA9/DE8', isSelected: false, rawData: 'AAS/BA9/DE8' },
    { id: 'AXX/BA4/DE9', name: 'AXX/BA4/DE9', value: 'AXX/BA4/DE9', isSelected: false, rawData: 'AXX/BA4/DE9' },
    { id: 'AAS/BA4/DE10', name: 'AAS/BA4/DE10', value: 'AAS/BA4/DE10', isSelected: false, rawData: 'AAS/BA4/DE10' }
  ];

  selectedFundingFilter = 'Show All';

  fundingGridMockAssociationData = [
    'AAS/BA4/DE1',
    'AAS/BA4/DE2',
    'AAS/BA4/DE3',
    'APT/BZ2/DE4',
    'AAS/BA4/DE5',
    'ATT/BA9/DE6',
    'AAS/BC4/DE7',
    'AAS/BA9/DE8',
    'AXX/BA4/DE9',
    'AAS/BA4/DE10',
  ];

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
  fundingGridRows: ScheduleDataMockInterface[];

  busy: boolean;
  firstTimeLoading: boolean;
  currentRowDataState: ScheduleRowDataStateInterface = {};

  constructor(
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.loadFundsGrid();
    this.drawGanttChart();
  }

  onFundingRowAdd(event: any) {
    if (this.currentRowDataState.isEditMode) {
      return;
    }
    const id = this.fundingGridRows.length ? Math.max.apply(Math, this.fundingGridRows.map(row => row.id)) : 0;
    this.fundingGridRows.push(
      {
        id: id + 1,
        taskDescription: '',
        fundingLineAssociation: '',
        startDate: formatDate(new Date(this.currentFiscalYear + '-01-01 00:00:00'), 'MM/dd/yyyy', 'en-US'),
        endDate: formatDate(new Date((this.currentFiscalYear + 5) + '-12-31  00:00:00'), 'MM/dd/yyyy', 'en-US'),
        order: id,
        action: this.fundingGridActionState.EDIT
      }
    );
    this.currentRowDataState.isAddMode = true;
    this.gridApi.setRowData(this.fundingGridRows);
    this.editRow(id + 1);
  }

  drawGanttChart(redraw?: boolean) {
    const data: any[] = [
      [
        'Task ID',
        'Task Name',
        'Start Date',
        'End Date',
        'Duration',
        'Percent Complete',
        'Dependencies'
      ]
    ];
    if (this.selectedFundingFilter.toLowerCase() !== 'show all') {
      this.fundingGridRows.filter(
        (row, index) =>
          row.fundingLineAssociation === this.selectedFundingFilter ||
          index === 0
      ).forEach(row => {
        data.push([
          row.id + '',
          '',
          new Date(row.startDate),
          new Date(row.endDate),
          0,
          100,
          row.id === 0 ? null : '0'
        ]);
      });
    } else {
      this.fundingGridRows.forEach(row => {
        data.push([
          row.id + '',
          '',
          new Date(row.startDate),
          new Date(row.endDate),
          0,
          100,
          row.id === 0 ? null : '0'
        ]);
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
    if (this.chart && !this.firstTimeLoading || redraw) {
      this.firstTimeLoading = true;
      this.chart.draw();
    }
  }

  drawTitleOnTop() {
    const g = document.getElementsByTagName('svg')[0].getElementsByTagName('g')[1];
    document.getElementsByTagName('svg')[0].parentElement.style.top = '40px';
    document.getElementsByTagName('svg')[0].style.overflow = 'visible';
    const height = Number(g.getElementsByTagName('text')[0].getAttribute('y')) + 15;
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
  }

  private loadFundsGrid() {
    this.loadFundColumns();
    this.loadFundsData();
  }

  private loadFundColumns() {
    this.fundingGridColumnDefinitions.push(
      {
        headerName: 'ID',
        field: 'id',
        editable: false,
        suppressMovable: true,
        maxWidth: 60,
        filter: false,
        sortable: false,
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
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
      },
      {
        headerName: 'Funding Line Association',
        field: 'fundingLineAssociation',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' },
        cellEditor: 'select',
        cellEditorParams: {
          cellHeight: 50,
          values: this.fundingGridMockAssociationData
        }
      },
      {
        headerName: 'Start Date',
        field: 'startDate',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' },
        cellRendererFramework: DatePickerCellRendererComponent,
        cellEditorFramework: DatePickerCellEditorComponent,
        minWidth: 145,
      },
      {
        headerName: 'End Date',
        field: 'endDate',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' },
        cellRendererFramework: DatePickerCellRendererComponent,
        cellEditorFramework: DatePickerCellEditorComponent,
        minWidth: 145,
      },
      {
        headerName: 'Actions',
        field: 'action',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        cellRendererFramework: ActionCellRendererComponent,
        maxWidth: 120
      }
    );
  }

  onFilterSelection(item: ListItem) {
    if (item && item.value) {
      this.selectedFundingFilter = item.value;
      if (item.value.toLowerCase() === 'show all') {
        this.gridApi.setRowData(this.fundingGridRows);
      } else {
        this.gridApi.setRowData(this.fundingGridRows.filter(
          (row, index) =>
            row.fundingLineAssociation === item.value ||
            index === 0
        ));
      }
      this.drawGanttChart(true);
    }
  }

  private loadFundsData() {
    this.fundingGridRows = [
      {
        id: 0,
        taskDescription: '',
        fundingLineAssociation: '',
        startDate: formatDate(new Date(this.currentFiscalYear + '-01-01 00:00:00'), 'MM/dd/yyyy', 'en-US'),
        endDate: formatDate(new Date((this.currentFiscalYear + 5) + '-12-31 00:00:00'), 'MM/dd/yyyy', 'en-US'),
        order: 0,
        action: null
      },
      {
        id: 1,
        taskDescription: 'Mocked Task #1',
        fundingLineAssociation: 'ATT/BA9/DE6',
        startDate: formatDate(new Date(), 'MM/dd/yyyy', 'en-US'),
        endDate: formatDate(new Date('2020-04-01'), 'MM/dd/yyyy', 'en-US'),
        order: 1,
        action: this.fundingGridActionState.VIEW
      },
      {
        id: 2,
        taskDescription: 'Mocked Task #2',
        fundingLineAssociation: 'AAS/BA4/DE1',
        startDate: formatDate(new Date(), 'MM/dd/yyyy', 'en-US'),
        endDate: formatDate(new Date('2020-04-02'), 'MM/dd/yyyy', 'en-US'),
        order: 2,
        action: this.fundingGridActionState.VIEW
      },
      {
        id: 3,
        taskDescription: 'Mocked Task #3',
        fundingLineAssociation: 'AAS/BA9/DE8',
        startDate: formatDate(new Date(), 'MM/dd/yyyy', 'en-US'),
        endDate: formatDate(new Date('2020-05-01'), 'MM/dd/yyyy', 'en-US'),
        order: 3,
        action: this.fundingGridActionState.VIEW
      },
      {
        id: 4,
        taskDescription: 'Mocked Task #4',
        fundingLineAssociation: 'AAS/BC4/DE7',
        startDate: formatDate(new Date(), 'MM/dd/yyyy', 'en-US'),
        endDate: formatDate(new Date('2024-12-31'), 'MM/dd/yyyy', 'en-US'),
        order: 4,
        action: this.fundingGridActionState.VIEW
      }
    ];
  }

  onMouseDown(event: MouseEvent) {
    if (this.currentRowDataState.isEditMode) {
      this.gridApi.startEditingCell({
        rowIndex: this.currentRowDataState.currentEditingRowIndex,
        colKey: 'taskDescription'
      });
    }
  }

  onRowEditingStarted(event: any) {
    if (!this.currentRowDataState.isEditMode) {
      this.gridApi.stopEditing();
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
    const row: ScheduleDataMockInterface = this.fundingGridRows[rowIndex];
    const canSave = this.validateRowData(row);
    if (canSave) {
      this.busy = true;
      this.viewMode(rowIndex);
      this.updateGanttChart();
    } else {
      this.editRow(rowIndex);
    }
    this.busy = false;
  }

  private validateRowData(row: ScheduleDataMockInterface) {
    let errorMessage = '';
    if (!row.taskDescription.length) {
      errorMessage = 'Task Description cannot be empty.';
    } else if (row.taskDescription.length > 45) {
      errorMessage = 'Task Description cannot have more than 45 characters.';
    } else if (!this.fundingGridMockAssociationData.filter(fund => fund === row.fundingLineAssociation).length) {
      errorMessage = 'Please, select a valid Funding Line Association.';
    } else if (!this.validateDate(row.startDate)) {
      errorMessage = 'Make sure Start Date is a valid date in the format (Month/Day/Year).';
    } else if (!this.validateDate(row.endDate)) {
      errorMessage = 'Make sure End Date is a valid date in the format (Month/Day/Year).';
    } else if (new Date(row.startDate) > new Date(row.endDate)) {
      errorMessage = 'Start Date cannot be greater than End Date.';
    } else if (new Date(row.startDate).getFullYear() < this.currentFiscalYear ||
      new Date(row.endDate).getFullYear() > this.currentFiscalYear + 5) {
      errorMessage = 'Start Date cannot be less than the current fiscal year (' + this.currentFiscalYear +
        ') and End Date cannot greater than ' + (this.currentFiscalYear + 5) + '.';
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
        if (date.getFullYear() === Number(dateSplit[2]) &&
          date.getMonth() === Number(dateSplit[0]) - 1 &&
          date.getDate() === Number(dateSplit[1])) {
          return true;
        }
      } catch (err) {
        return false;
      }
    }
    return false;
  }

  private cancelRow(rowIndex: number) {
    this.fundingGridRows[rowIndex] = this.currentRowDataState.currentEditingRowData;
    this.viewMode(rowIndex);
    this.updateGanttChart();
  }

  private editRow(rowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.currentRowDataState.currentEditingRowData = { ...this.fundingGridRows[rowIndex] };
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
    this.fundingGridRows.splice(rowIndex, 1);
    this.fundingGridRows.forEach(row => {
      row.order--;
    });
    this.currentRowDataState.currentEditingRowIndex = 0;
    this.currentRowDataState.isEditMode = false;
    this.currentRowDataState.isAddMode = false;
    this.gridApi.stopEditing();
    this.fundingGridRows.forEach(row => {
      row.isDisabled = false;
    });
    this.gridApi.setRowData(this.fundingGridRows);
    this.updateGanttChart();
    this.busy = false;
  }

  private viewMode(rowIndex: number) {
    this.currentRowDataState.currentEditingRowIndex = 0;
    this.currentRowDataState.isEditMode = false;
    this.currentRowDataState.isAddMode = false;
    this.gridApi.stopEditing();
    this.fundingGridRows[rowIndex].action = this.fundingGridActionState.VIEW;
    this.fundingGridRows.forEach(row => {
      row.isDisabled = false;
    });
    this.gridApi.setRowData(this.fundingGridRows);
  }

  private editMode(rowIndex: number) {
    this.currentRowDataState.currentEditingRowIndex = rowIndex;
    this.currentRowDataState.isEditMode = true;
    this.fundingGridRows[rowIndex].action = this.fundingGridActionState.EDIT;
    this.fundingGridRows.forEach((row, index) => {
      if (rowIndex !== index) {
        row.isDisabled = true;
      }
    });
    this.gridApi.setRowData(this.fundingGridRows);
    this.gridApi.startEditingCell({
      rowIndex,
      colKey: 'taskDescription'
    });
  }

}

export interface ScheduleDataMockInterface {

  id?: number;
  taskDescription?: string;
  fundingLineAssociation?: string;
  startDate?: string;
  endDate?: string;
  order?: number;
  action?: Action;
  isDisabled?: boolean;

}

export interface ScheduleRowDataStateInterface {

  currentEditingRowIndex?: number;
  isAddMode?: boolean;
  isEditMode?: boolean;
  currentEditingRowData?: ScheduleDataMockInterface;

}
