import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
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
import { FundingLineService } from '../../../services/funding-line.service';
import { map } from 'rxjs/operators';
import { FundingLine } from '../../../models/funding-line.model';
import { Program } from '../../../models/Program';

@Component({
  selector: 'pfm-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  @Input() program: Program;

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
  fundingGridRows: ScheduleDataMockInterface[];

  busy: boolean;
  firstTimeLoading: boolean;
  currentRowDataState: ScheduleRowDataStateInterface = {};

  constructor(private dialogService: DialogService, private fundingLineService: FundingLineService) {}

  ngOnInit() {
    this.loadFundingLines();
    this.loadFundsGrid();
    this.drawGanttChart();
  }

  loadFundingLines() {
    this.fundingFilter = [
      {
        id: 'Show All',
        name: 'Show All',
        value: 'Show All',
        isSelected: true,
        rawData: 'Show All'
      }
    ];
    this.fundingGridAssociations = [];
    this.fundingLineService
      .obtainFundingLinesByProgramId(this.program.id)
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
      .subscribe(fundingLines => {
        for (const fundingLine of fundingLines) {
          this.fundingFilter.push(fundingLine);
          this.fundingGridAssociations.push(fundingLine);
        }
      });
  }

  onFundingRowAdd(event: any) {
    if (this.currentRowDataState.isEditMode) {
      return;
    }
    const id = this.fundingGridRows.length
      ? Math.max.apply(
          Math,
          this.fundingGridRows.map(row => row.id)
        )
      : 0;
    this.fundingGridRows.push({
      id: id + 1,
      taskDescription: '',
      fundingLineAssociation: '',
      startDate: formatDate(new Date(this.currentFiscalYear + '-01-01 00:00:00'), 'MM/dd/yyyy', 'en-US'),
      endDate: formatDate(new Date(this.currentFiscalYear + 5 + '-12-31  00:00:00'), 'MM/dd/yyyy', 'en-US'),
      order: id,
      action: this.fundingGridActionState.EDIT
    });
    this.currentRowDataState.isAddMode = true;
    this.gridApi.setRowData(this.fundingGridRows);
    this.editRow(this.fundingGridRows.length - 1);
  }

  drawGanttChart(redraw?: boolean) {
    const data: any[] = [
      ['Task ID', 'Task Name', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']
    ];
    data.push([
      '0',
      '',
      new Date(this.currentFiscalYear + '-01-01 00:00:00'),
      new Date(this.currentFiscalYear + 5 + '-12-31 00:00:00'),
      0,
      100,
      null
    ]);
    if (this.selectedFundingFilter.toLowerCase() !== 'show all') {
      this.fundingGridRows
        .filter((row, index) => row.fundingLineAssociation === this.selectedFundingFilter)
        .forEach(row => {
          data.push([row.id + '', '', new Date(row.startDate), new Date(row.endDate), 0, 100, '0']);
        });
    } else {
      this.fundingGridRows.forEach(row => {
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
    if ((this.chart && !this.firstTimeLoading) || redraw) {
      this.firstTimeLoading = true;
      this.chart.draw();
    }
  }

  drawTitleOnTop() {
    const g = document.getElementsByTagName('svg')[0].getElementsByTagName('g')[1];
    document.getElementsByTagName('svg')[0].parentElement.style.top = '40px';
    document.getElementsByTagName('svg')[0].style.overflow = 'visible';
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
        field: 'fundingLineAssociation',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' },
        cellEditor: 'agSelectCellEditor',
        valueFormatter: params => {
          if (params.value) {
            return this.fundingGridAssociations.find(x => x.id === params.value).name;
          }
          return '';
        },
        cellEditorParams: params => {
          return {
            cellHeight: 50,
            values: [...this.fundingGridAssociations.map(x => x.id)]
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
      if (item.value.toLowerCase() === 'show all') {
        this.gridApi.setRowData(this.fundingGridRows);
      } else {
        this.gridApi.setRowData(this.fundingGridRows.filter((row, index) => row.fundingLineAssociation === item.value));
      }
      this.drawGanttChart(true);
    }
  }

  private loadFundsData() {
    this.fundingGridRows = [];
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
    } else if (!this.fundingGridAssociations.some(fund => fund.id === row.fundingLineAssociation)) {
      errorMessage = 'Please, select a valid Funding Line Association.';
    } else if (!this.validateDate(row.startDate)) {
      errorMessage = 'Make sure Start Date is a valid date in the format (Month/Day/Year).';
    } else if (!this.validateDate(row.endDate)) {
      errorMessage = 'Make sure End Date is a valid date in the format (Month/Day/Year).';
    } else if (new Date(row.startDate) > new Date(row.endDate)) {
      errorMessage = 'Start Date cannot be greater than End Date.';
    } else if (
      new Date(row.startDate).getFullYear() < this.currentFiscalYear ||
      new Date(row.endDate).getFullYear() > this.currentFiscalYear + 5
    ) {
      errorMessage =
        'Start Date cannot be less than the current fiscal year (' +
        this.currentFiscalYear +
        ') and End Date cannot greater than ' +
        (this.currentFiscalYear + 5) +
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
