import { Component, OnInit, ViewChild } from '@angular/core';
import { ExecutionService, ProgramsService, ExecutionEvent, ExecutionLine, ExecutionDropDown, Execution } from '../../../generated';
import { ActivatedRoute, UrlSegment } from '../../../../../node_modules/@angular/router';
import { forkJoin } from '../../../../../node_modules/rxjs/observable/forkJoin';

// Other Components
import { HeaderComponent } from '../../header/header.component'
import { ExecutionLineWrapper } from '../model/execution-line-wrapper';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';

@Component({
  selector: 'app-execution-line-details',
  templateUrl: './execution-line-details.component.html',
  styleUrls: ['./execution-line-details.component.scss']
})
export class ExecutionLineDetailsComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private current: ExecutionLineWrapper;
  private phase: Execution;
  private events: EventItem[] = [];
  private dropdowns: ExecutionDropDown[] = [];
  private programIdNameLkp: Map<string, string> = new Map<string, string>();
  
  private agOptions: GridOptions;
  private menuTabs = ['filterMenuTab'];

  constructor(private exesvc: ExecutionService, private progsvc: ProgramsService,
    private route: ActivatedRoute) {
    this.agOptions = <GridOptions>{
      enableSorting: true,
      enableFilter: true,
      gridAutoHeight: true,
      pagination: true,
      paginationPageSize: 30,
      suppressPaginationPanel: true,
      columnDefs: [
        { headerName: 'Date', field: 'date' },
        { headerName: 'Category', field: 'category' },
        { headerName: 'Type', field: 'type' }
      ]
    };
  }

  ngOnInit() {
    var my: ExecutionLineDetailsComponent = this;
    this.route.url.subscribe((segments: UrlSegment[]) => {
      var exelineid = segments[segments.length - 1].path;

      forkJoin([
        my.exesvc.getExecutionLineById(exelineid),
        my.exesvc.getExecutionDropdowns(),
        my.exesvc.getExecutionEventsByExecutionLine(exelineid),
        my.progsvc.getIdNameMap(),
      ]).subscribe(data => {
        my.current = {
          line: data[0].result
        }

        my.exesvc.getById(my.current.line.phaseId).subscribe(data => { 
          my.phase = data.result;
        });

        my.dropdowns = data[1].result;

        var evarr: EventItem[] = [];
        data[2].result.forEach((x: ExecutionEvent) => {
          var isfrom: boolean = (my.current.line.id === x.value.fromId);
          var fromissource: boolean = (x.value.fromIsSource);
          var amt: number = 0;
          var tolkp: Map<string, number> = new Map<string, number>();
          var totalto: number = 0;

          Object.getOwnPropertyNames(x.value.toIdAmtLkp).forEach(key => {
            tolkp.set(key, x.value.toIdAmtLkp[key]);
            totalto += x.value.toIdAmtLkp[key];
          });
          if (tolkp.has(my.current.line.id)) {
            amt = tolkp.get(my.current.line.id);
          }
          else {
            amt = totalto;
          }

          evarr.push({
            date: new Date(x.timestamp),
            category: x.eventType,
            type: my.dropdowns.filter(dd=>dd.subtype ===x.value.type )[0].name,
            amt: amt,
            user: x.userCN
          });
        });

        my.events = evarr;
        console.log(my.events);
        setTimeout(() => {
          my.agGrid.api.sizeColumnsToFit();
        }, 500);

        Object.getOwnPropertyNames(data[3].result).forEach(id => {
          my.programIdNameLkp.set(id, data[3].result[id]);
        });
      });
    });
  }

  fullname(exeline: ExecutionLine): string {
    if (this.programIdNameLkp && exeline) {
      return this.programIdNameLkp.get(exeline.mrId);
    }
    else {
      return '';
    }
  }

  onGridReady(params) {
    window.addEventListener("resize", function () {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }
}

interface EventItem {
  date: Date,
  category: string,
  type: string,
  amt: number,
  user: string
}
