import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ListItemHelper } from '../../util/ListItemHelper';
import { ListItem } from '../../pfm-common-models/ListItem';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { ExecutionService } from '../services/execution.service';
import { ColDef } from '@ag-grid-community/all-modules';
import { AttachmentCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/attachment-cell-renderer/attachment-cell-renderer.component';
import { MpActionCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/mp-action-cell-renderer/mp-action-cell-renderer.component';

@Component({
  selector: 'app-funds-update',
  templateUrl: './funds-update.component.html',
  styleUrls: ['./funds-update.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FundsUpdateComponent implements OnInit {
  years: ListItem[];
  columnDefs: ColDef[];
  yearSelected: number;

  constructor(private executionService: ExecutionService) {}

  ngOnInit(): void {
    this.executionService.getExecutionYears().subscribe(resp => {
      this.years = (resp as any).result
        .map(e => e.fy)
        .sort()
        .map(year => {
          return {
            id: year,
            disabled: false,
            isSelected: false,
            name: 'Execution FY' + (year % 100),
            value: 'Execution FY' + (year % 100),
            rawData: year
          } as ListItem;
        });
    });
    this.setupGrid();
  }

  private setupGrid() {
    this.columnDefs = [
      {
        minWidth: 30,
        maxWidth: 30,
        headerCheckboxSelection: true,
        checkboxSelection: true
      },
      {
        headerName: 'Program',
        field: 'program',
        sort: 'asc',
        cellClass: 'pfm-datagrid-text',
        minWidth: 50
      },
      {
        headerName: 'APPN',
        field: 'appn',
        cellClass: 'pfm-datagrid-text',
        minWidth: 70
      },
      {
        headerName: 'BA/BLIN',
        field: 'blin',
        cellClass: 'pfm-datagrid-text',
        minWidth: 70
      },
      {
        headerName: 'SAG',
        field: 'sag',
        cellClass: 'pfm-datagrid-text',
        minWidth: 70
      },
      {
        headerName: 'WUCD',
        field: 'wucd',
        cellClass: 'pfm-datagrid-text',
        minWidth: 70
      },
      {
        headerName: 'EXP Type',
        field: 'exp',
        cellClass: 'pfm-datagrid-text',
        minWidth: 70
      },
      {
        headerName: 'OA',
        field: 'oa',
        cellClass: 'pfm-datagrid-text',
        minWidth: 50
      },
      {
        headerName: 'PE',
        field: 'pe',
        cellClass: 'pfm-datagrid-text',
        minWidth: 70
      },
      {
        headerName: 'PBxx',
        field: 'pb',
        minWidth: 55,
        cellClass: 'pfm-datagrid-numeric-class',
        valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
      },
      {
        headerName: 'TOA',
        field: 'toa',
        minWidth: 70,
        cellClass: 'pfm-datagrid-numeric-class',
        valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
      },
      {
        headerName: 'Released',
        field: 'released',
        minWidth: 70,
        cellClass: 'pfm-datagrid-numeric-class',
        valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
      },
      {
        headerName: 'Withhold',
        field: 'withhold',
        minWidth: 70,
        cellClass: 'pfm-datagrid-numeric-class',
        valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
      },
      {
        headerName: 'Actions',
        field: 'actions',
        minWidth: 70,
        cellClass: 'text-class'
      }
    ];
  }

  currencyFormatter(params) {
    return (
      '$ ' +
      Math.floor(params)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    );
  }

  onYearChange(year: any): void {
    this.yearSelected = year ? year.rawData : undefined;
  }

  //Just for testing purpose
  rows = [
    {
      program: 'CAS',
      appn: 'PROC',
      blin: 'BA4',
      sag: 'xxx',
      wucd: 'xxx',
      exp: 'xxx',
      oa: 'SY',
      pe: '0604883BP',
      pb: 32456000,
      toa: 32456000,
      released: 8500000,
      withhold: 1000000,
      actions: ''
    },
    {
      program: 'BAS',
      appn: 'PROC',
      blin: 'BA4',
      sag: 'xxx',
      wucd: 'xxx',
      exp: 'xxx',
      oa: 'SY',
      pe: '0604883BP',
      pb: 32456000,
      toa: 32456000,
      released: 8500000,
      withhold: 1000000,
      actions: ''
    },
    {
      program: 'AAS',
      appn: 'PROC',
      blin: 'BA4',
      sag: 'xxx',
      wucd: 'xxx',
      exp: 'xxx',
      oa: 'SY',
      pe: '0604883BP',
      pb: 32456000,
      toa: 32456000,
      released: 8500000,
      withhold: 1000000,
      actions: ''
    }
  ];
}
