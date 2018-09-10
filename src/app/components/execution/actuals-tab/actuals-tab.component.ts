import { Component, OnInit, ViewChild, Input } from '@angular/core'

// Other Components
import { Router } from '@angular/router'
import { ProgramsService } from '../../../generated/api/programs.service';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { ProgramCellRendererComponent } from '../../renderers/program-cell-renderer/program-cell-renderer.component';
import { OandEMonthly, ExecutionLine, Execution } from '../../../generated';

@Component({
  selector: 'actuals-tab',
  templateUrl: './actuals-tab.component.html',
  styleUrls: ['./actuals-tab.component.scss']
})

export class ActualsTabComponent implements OnInit {

  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private actuals: Map<string, string> = new Map<string, string>();
  private rows: {}[];
  private selectedRow: number = -1;
  private columnDefs: any[];
  private firstMonth = 0;
  @Input() private oandes: OandEMonthly[];
  @Input() private exeline: ExecutionLine;
  @Input() private exe: Execution;

  constructor() {
    var my: ActualsTabComponent = this;

    this.rows = [
      { actuals: 'TOA' },
      { actuals: 'Released' },
      { actuals: 'Committed (Monthly)' },
      { actuals: 'Cumulative Committed' },
      { actuals: 'Obligated (Monthly)' },
      { actuals: 'Cumulative Obligated' },
      { actuals: 'OSD Goal' },
      { actuals: 'Delta' },
      { actuals: 'Outlayed (Monthly)' },
      { actuals: 'Cumulative Outlayed' },
      { actuals: 'OSD Goal' },
      { actuals: 'Delta' },
      { actuals: 'Accruals (Monthly)' },
      { actuals: 'Cumulative Accruals' },    
    ];

    var valueGetter = function (params) {
      if (!my.oandes) {
        return '';
      }
      // first, figure out which column we're in so we know which month to get
      // then, figure out which row we're in so we can calculate the amount
      
      // col will be from 0-11, representing the months of the FY
      var col: number = Number.parseInt(params.column.colId) - 1;

      var oande: OandEMonthly;
      my.oandes.filter(oe => (oe.month === (col + my.firstMonth))).forEach(oe => { 
        // at most one of these
        oande = oe;
      });
      
      if (oande) {
        
      }
      else {
        // no monthly value yet
        return '';
      }

      var row :number = Number.parseInt( params.node.id );

      return row + '-' + col;
    };

    this.columnDefs = [
      {
        headerName: 'Fiscal Year',//x => ('FY ' + (this.exe.fy + (this.firstMonth / 12) - 2000)),
          children: [
            {
              headerName: 'Actuals',
              field: 'actuals',
              filter: 'agTextColumnFilter',
              cellClass: ['ag-cell-white', 'ag-link'],
              //cellRenderer: function(params){
              //  return "<a data-toggle='modal' + href='#myModal"
              //  + "'> "+params.value+"</a>";
              //}
            },
            {
              headerName: 'Oct',
              valueGetter: valueGetter,
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Nov',
              valueGetter: valueGetter,
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Dec',
              valueGetter: valueGetter,
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Jan',
              valueGetter: valueGetter,
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Feb',
              valueGetter: valueGetter,
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Mar',
              valueGetter: valueGetter,
              maxWidth: 80,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Apr',
              valueGetter: valueGetter,
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'May',
              valueGetter: valueGetter,
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Jun',
              valueGetter: valueGetter,
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Jul',
              valueGetter: valueGetter,
              maxWidth: 80,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Aug',
              valueGetter: valueGetter,
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Sep',
              valueGetter: valueGetter,
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            }
          ]
        }
    ];
  }

  ngOnInit() { }

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
