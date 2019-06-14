import {Component, Input, OnChanges, ViewChild} from '@angular/core';
import {R4Data, PropertyService, PropertyType, BPI} from '../../../../generated';
import {AgGridNg2} from 'ag-grid-angular';
import {DeleteRenderer} from '../../../renderers/delete-renderer/delete-renderer.component';
import {FormatterUtil} from '../../../../utils/formatterUtil';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'r4a-tab',
  templateUrl: './r4a-tab.component.html',
  styleUrls: ['./r4a-tab.component.scss']
})
export class R4aTabComponent implements OnChanges {

  @ViewChild('agGrid') agGrid: AgGridNg2;

  @Input() bpi?: BPI;

  r4Data: R4Data[];
  selectedPE: string;
  selectedItem: string;
  columnDefs;
  defaultColDef;
  rowData = [];
  selectedRow;
  gridSequence;
  fy: number;
  startYs: number[];
  endYs: number[];
  endQs: number[];
  events: string[];
  agOptions: GridOptions;

  constructor(private propertyService: PropertyService) {
    this.initYears(parseInt(Date().substring(11, 15)));
    this.endQs = [1, 2, 3, 4];
    this.events = [];
    this.propertyService.getByPropertyType(PropertyType.R4A_MILESTONE).subscribe(response => {
      if (response.result) {
        response.result.forEach(event => this.events.push(event.code + '-' + event.label));
      }
    });

    this.agOptions = <GridOptions>{
      defaultColDef: {
        filter: false,
        suppressMenu: true,
        editable: true,
        resizable: false,
      },
      suppressMovableColumns: true,
      suppressRowTransform: true,
      suppressPaginationPanel: true,
      singleClickEdit: true,
      frameworkComponents: { deleteRenderer: DeleteRenderer },
      context: {
        parentComponent: this,
        deleteHidden: false
      }
    }
  }

  async ngOnChanges() {
    this.r4Data = this.bpi.r4Data;
    this.selectedPE = this.bpi.pe;
    this.selectedItem = this.bpi.item;
    await setTimeout(() => {}, 3000);
    this.initColumnDefs();
  }



  initColumnDefs() {

    const columnDefs = [
      {
        headerName: '',
        headerClass: ['invisible-cell'],
        children: [{
        headerName: '',
        colId: 'delete',
        cellRenderer: 'deleteRenderer',
        editable: false,
        cellStyle: {'text-align': 'center'},
        minWidth: 60,
        maxWidth: 60,
        cellClass: 'ag-cell-white',
      },
      {
        headerName: 'Event',
        field: 'eventName',
        cellClass: 'ag-cell-edit',
        width: 400,
        filter: 'agSelectColumnFilter',
        cellEditorSelector: params => {
          return {
            component: 'agSelectCellEditor',
            params: {values: this.events}
          };
        },
      }]
      }, {
      headerName: 'Start',
      children: [{
        headerName: 'Start Quarter',
        field: 'startQuarter',
        width:100,
        cellClass: 'ag-cell-edit',
        cellEditorSelector: params => {
          return {
            component: 'agSelectCellEditor',
            params: {values: [1,2,3,4]}
          };
        },
      },
      {
        headerName: 'Start Year',
        field: 'startYear',
        width:100,
        cellClass: 'ag-cell-edit',
        cellEditorSelector: params => {
          return {
            component: 'agSelectCellEditor',
            params: {values: this.startYs}
          };
        },
        onCellValueChanged: params => this.resetYears(parseInt(params['newValue']))
      }]
      },
      {headerName: 'End',
      children: [{
        headerName: 'End Quarter',
        field: 'endQuarter',
        width:100,
        cellClass: 'ag-cell-edit',
        cellEditorSelector: params => {
          return {
            component: 'agSelectCellEditor',
            params: {values: this.endQs}
          };
        },
      },
      {
        headerName: 'End Year',
        field: 'endYear',
        width:100,
        cellClass: 'ag-cell-edit',
        cellEditorSelector: params => {
          return {
            component: 'agSelectCellEditor',
            params: {values: this.endYs}
          };
        },
      }]
      }

    ];
    this.columnDefs = columnDefs;
    this.initRowData();
  }

  onSelectionChanged() {
    this.agGrid.api.getSelectedRows().forEach(row => {
      this.selectedRow = row;
    });
  }

  onExplanationSelected(value) {
    this.selectedRow.increaseDecreaseStatement = value + '\n';
  }

  delete(rowIndex, data) {
    this.agGrid.api.updateRowData({remove: [data]});
    this.r4Data.splice(rowIndex, 1);
  }

  initRowData() {
    if (this.agGrid) {
      this.agGrid.api.setRowData(this.r4Data ? this.r4Data : []);
    }
  }

  addRow() {
    if (this.gridSequence) {
      this.gridSequence++;
    } else {
      this.gridSequence = this.agGrid.api.getDisplayedRowCount();
    }
    const data: R4Data = {
      eventName: '',
      startQuarter: 0,
      startYear: 0,
      endQuarter: 0,
      endYear: 0
    };
    this.r4Data.push(data);
    this.agGrid.api.updateRowData({
      add: [data]
    });
    this.sizeColumnsToFit();
  }

  onGridReady(params) {
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 500);
    window.addEventListener('resize', function () {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  initYears(cy: number) {
    this.fy = cy;
    this.startYs = [cy - 7, cy - 6, cy - 5, cy - 4, cy - 3, cy - 2, cy - 1, cy];
    this.endYs = [cy, cy + 1, cy + 2, cy + 3, cy + 4, cy + 5, cy + 6];
  }
  resetYears(cy: number) {
    this.endYs = [];
    while (cy < this.fy) {
      this.endYs.push(cy++);
    }
    this.endYs.push(...[this.fy, this.fy + 1, this.fy + 2, this.fy + 3, this.fy + 4, this.fy + 5, this.fy + 6, this.fy + 7]);
  }

  sizeColumnsToFit() {
    this.agGrid.api.sizeColumnsToFit();
  }

  invalid(): boolean {
    const isCellUnfilled = this.r4Data.some(data => data.eventName === '' ||
      data.startQuarter === 0 ||
      data.startYear === 0 ||
      data.endQuarter === 0 ||
      data.endYear === 0);
    const isDataInvalid = this.r4Data.some(data => {
      const start = data.startYear.toString() + data.startQuarter.toString();
      const end = data.endYear.toString() + data.endQuarter.toString();
      return end < start;
    });
    return isDataInvalid || isCellUnfilled || FormatterUtil.hasDuplicates(this.r4Data, 'eventName');
  }
}
