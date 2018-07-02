import { Component, OnInit, ViewChild } from '@angular/core'
import * as $ from 'jquery'

// Other Components
import { HeaderComponent } from '../../../components/header/header.component'
import { PBService } from '../../../generated/api/pB.service'
import { MyDetailsService } from '../../../generated/api/myDetails.service'
import { ExecutionService } from '../../../generated/api/execution.service'
import { ExecutionTransfer } from '../../../generated/model/executionTransfer'
import { PB } from '../../../generated/model/pB'
import { Execution } from '../../../generated/model/execution'
import { Router, ActivatedRoute, UrlSegment } from '@angular/router'
import { ExecutionLine, ProgramsService } from '../../../generated';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'update-program-execution',
  templateUrl: './update-program-execution.component.html',
  styleUrls: ['./update-program-execution.component.scss']
})
export class UpdateProgramExecutionComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private current: ExecutionLine;
  private progname: string;

  constructor(private exesvc: ExecutionService, private progsvc:ProgramsService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.url.subscribe((segments: UrlSegment[]) => {
      console.log(segments);

      var exelineid = segments[segments.length - 1].path;
      console.log(exelineid);
      
      this.exesvc.getExecutionLineById(exelineid).subscribe(data => { 
        if (data.error) {
          console.log(data.error);
        }
        else {
          this.current = data.result;
          this.progsvc.getFullName(this.current.mrId).subscribe(d2 => {
            this.progname = d2.result;
          });
        }
      });
    });
  }

  submit() {
    /*
    var et: ExecutionTransfer = {
      toIdAmtLkp: {},
      fromId: 'from id',
      eventType: 'etype',
      transType: 'REALIGNMENT'
    };
    et.toIdAmtLkp['09848'] = 56;

    this.exesvc.createTransfer("1234", new Blob(["stuff"]),
      new Blob([JSON.stringify(et)])).subscribe();
    */
  }
}
