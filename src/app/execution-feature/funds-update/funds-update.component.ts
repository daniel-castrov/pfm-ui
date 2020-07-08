import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ListItem } from '../../pfm-common-models/ListItem';
import { ExecutionService } from '../services/execution.service';
import { ColDef } from '@ag-grid-community/all-modules';
import { ExecutionLineService } from '../services/execution-line.service';
import { ExecutionLine } from '../models/execution-line.model';
import { RestResponse } from 'src/app/util/rest-response';

@Component({
  selector: 'app-funds-update',
  templateUrl: './funds-update.component.html',
  styleUrls: ['./funds-update.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FundsUpdateComponent implements OnInit {
  years: ListItem[];
  columnDefs: ColDef[];
  selectedYear: number;

  rows = [];

  constructor(private executionService: ExecutionService, private executionLineService: ExecutionLineService) {}

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
        headerValueGetter: params => (this.selectedYear ? 'PB' + (this.selectedYear % 100) : 'Initial Funds'),
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
    this.selectedYear = year ? year.rawData : undefined;
    if (this.selectedYear) {
      this.executionLineService.retrieveByYear(this.selectedYear).subscribe((resp: RestResponse<ExecutionLine[]>) => {
        const executionLines = resp.result;
        this.rows = [];
        executionLines.forEach(executionLine => {
          const row = {
            program: executionLine.programName,
            appn: executionLine.appropriation,
            blin: executionLine.blin,
            sag: '',
            wucd: '',
            exp: '',
            oa: executionLine.opAgency,
            pe: executionLine.programElement,
            pb: 0,
            toa: 0,
            released: 0,
            withhold: 0,
            actions: ''
          };
          this.rows.push(row);
          this.setupGrid();
        });
      });
    }
  }
}
