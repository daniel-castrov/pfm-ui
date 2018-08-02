import { Component, OnInit, ViewChild } from '@angular/core'

// Other Components
import { HeaderComponent } from '../../../components/header/header.component'
import { Router } from '@angular/router'
import { ExecutionService, Execution, MyDetailsService, Program, ExecutionLine } from '../../../generated'
import { GlobalsService} from '../../../services/globals.service'
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ProgramsService } from '../../../generated/api/programs.service';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { ProgramCellRendererComponent } from '../../renderers/program-cell-renderer/program-cell-renderer.component';

@Component({
  selector: 'oe-update',
  templateUrl: './oe-update.component.html',
  styleUrls: ['./oe-update.component.scss']
})

export class OeUpdateComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private programs: Map<string, string> = new Map<string, string>();
  private appropriations: string[] = [];
  private blins: string[] = [];
  private items: string[] = [];
  private opAgencies: string[] = [];
  private selectedRow: number = -1;
  private columnDefs: any[];
  private rowData: any[];

  private agOptions: GridOptions;

  ngOnInit() {}

  constructor() {
    this.columnDefs = [
      {
        headerName: 'Program',
        field: 'program',
        filter: 'agTextColumnFilter',
        cellClass: ['ag-cell-light-grey','ag-clickable']
      },
      {
        headerName: 'Appr',
        field: 'appropriation',
        cellClass: ['ag-cell-light-grey'],
        maxWidth: 92
      },
      {
        headerName: 'Budget',
        field: 'budget',
        cellClass: ['ag-cell-light-grey'],
        maxWidth: 92
      },
        {headerName: 'Item',
        field: 'item',
        cellClass: ['ag-cell-light-grey'],
        maxWidth: 92
      },
        {headerName: 'OpAgency',
        field: 'opAgency',
        cellClass: ['ag-cell-light-grey'],
        maxWidth: 92
      },
      {
        headerName: 'Funds',
        field: 'Funds',
        cellClass: ['ag-cell-light-green'],
        maxWidth: 92
      },
      {
        headerName: 'Released',
        field: 'released',
        cellClass: ['ag-cell-white'],
        maxWidth: 92
      },
      {
        headerName: 'Oblidged',
        field: 'oblidged',
        cellClass: ['ag-cell-white'],
        maxWidth: 92
      },
      {
        headerName: 'Outlayed',
        field: 'outlayed',
        cellClass: ['ag-cell-white'],
        maxWidth: 92
      },
      {
        headerName: 'Plan',
        field: 'plan',
        cellClass: ['ag-cell-white'],
        maxWidth: 92
      },
      {
        headerName: 'Last Upated',
        field: 'update',
        cellClass: ['ag-cell-white'],
        maxWidth: 92
      }
    ];

    this.rowData = [
        { program: 'testing', item: 'item 1', update: 35000 },
        { program: 'testing2', item: 'item 2', update: 5000 },
        { program: 'testing3', item: 'item 3', update: 4000 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing', item: 'item 1', update: 35000 },
        { program: 'testing2', item: 'item 2', update: 5000 },
        { program: 'testing3', item: 'item 3', update: 4000 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing', item: 'item 1', update: 35000 },
        { program: 'testing2', item: 'item 2', update: 5000 },
        { program: 'testing3', item: 'item 3', update: 4000 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing', item: 'item 1', update: 35000 },
        { program: 'testing2', item: 'item 2', update: 5000 },
        { program: 'testing3', item: 'item 3', update: 4000 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing', item: 'item 1', update: 35000 },
        { program: 'testing2', item: 'item 2', update: 5000 },
        { program: 'testing3', item: 'item 3', update: 4000 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing', item: 'item 1', update: 35000 },
        { program: 'testing2', item: 'item 2', update: 5000 },
        { program: 'testing3', item: 'item 3', update: 4000 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing', item: 'item 1', update: 35000 },
        { program: 'testing2', item: 'item 2', update: 5000 },
        { program: 'testing3', item: 'item 3', update: 4000 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing', item: 'item 1', update: 35000 },
        { program: 'testing2', item: 'item 2', update: 5000 },
        { program: 'testing3', item: 'item 3', update: 4000 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing', item: 'item 1', update: 35000 },
        { program: 'testing2', item: 'item 2', update: 5000 },
        { program: 'testing3', item: 'item 3', update: 4000 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing', item: 'item 1', update: 35000 },
        { program: 'testing2', item: 'item 2', update: 5000 },
        { program: 'testing3', item: 'item 3', update: 4000 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing', item: 'item 1', update: 35000 },
        { program: 'testing2', item: 'item 2', update: 5000 },
        { program: 'testing3', item: 'item 3', update: 4000 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing', item: 'item 1', update: 35000 },
        { program: 'testing2', item: 'item 2', update: 5000 },
        { program: 'testing3', item: 'item 3', update: 4000 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing', item: 'item 1', update: 35000 },
        { program: 'testing2', item: 'item 2', update: 5000 },
        { program: 'testing3', item: 'item 3', update: 4000 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing4', item: 'item 4', update: 300 },
        { program: 'testing', item: 'item 1', update: 35000 },
        { program: 'testing2', item: 'item 2', update: 5000 },
        { program: 'testing3', item: 'item 3', update: 4000 },
        { program: 'testing4', item: 'item 4', update: 300 }
    ];
  }

    onPageSizeChanged(event) {
      var selectedValue = Number(event.target.value);
      this.agGrid.api.paginationSetPageSize(selectedValue);
      this.agGrid.api.sizeColumnsToFit();
    }

    onGridReady(params) {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      }, 500);
      window.addEventListener("resize", function() {
        setTimeout(() => {
          params.api.sizeColumnsToFit();
        });
      });
    }
  }
