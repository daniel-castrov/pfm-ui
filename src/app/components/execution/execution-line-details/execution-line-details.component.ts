import { Component, OnInit } from '@angular/core';
import { ExecutionService, ProgramsService, ExecutionEvent, ExecutionLine, ExecutionDropDown } from '../../../generated';
import { ActivatedRoute, UrlSegment } from '../../../../../node_modules/@angular/router';
import { forkJoin } from '../../../../../node_modules/rxjs/observable/forkJoin';

@Component({
  selector: 'app-execution-line-details',
  templateUrl: './execution-line-details.component.html',
  styleUrls: ['./execution-line-details.component.scss']
})
export class ExecutionLineDetailsComponent implements OnInit {
  private current: ExecutionLine;
  private events: EventItem[] = [];
  private dropdowns: ExecutionDropDown[] = [];

  constructor(private exesvc: ExecutionService, private progsvc: ProgramsService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    var my: ExecutionLineDetailsComponent = this;
    this.route.url.subscribe((segments: UrlSegment[]) => {
      var exelineid = segments[segments.length - 1].path;

      forkJoin([
        my.exesvc.getExecutionLineById(exelineid),
        my.exesvc.getExecutionDropdowns(),
        my.exesvc.getExecutionEventsByExecutionLine(exelineid),
      ]).subscribe(data => {
        my.current = data[0].result;
        my.dropdowns = data[1].result;

        data[2].result.forEach((x: ExecutionEvent) => {
          var isfrom: boolean = (my.current.id === x.value.fromId);
          var fromissource: boolean = (x.value.fromIsSource);
          var amt: number = 0;
          var tolkp: Map<string, number> = new Map<string, number>();
          var totalto: number = 0;

          Object.getOwnPropertyNames(x.value.toIdAmtLkp).forEach(key => {
            tolkp.set(key, x.value.toIdAmtLkp[key]);
            totalto += x.value.toIdAmtLkp[key];
          });
          if (tolkp.has(my.current.id)) {
            amt = tolkp.get(my.current.id);
          }
          else {
            amt = totalto;
          }
          
          console.log(x);

          my.events.push({
            date: new Date(x.timestamp),
            category: x.eventType,
            type: my.dropdowns.filter(dd=>dd.subtype ===x.value.type )[0].name,
            amt: amt,
            user: x.userCN
          });
        });
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
