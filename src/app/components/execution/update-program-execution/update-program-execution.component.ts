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

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'update-program-execution',
  templateUrl: './update-program-execution.component.html',
  styleUrls: ['./update-program-execution.component.scss']
})
export class UpdateProgramExecutionComponent implements OnInit {
  @ViewChild(HeaderComponent) header;

  constructor(private exesvc:ExecutionService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.url.subscribe((segments: UrlSegment[]) => {
      var ufrid = segments[segments.length - 1].path;
      console.log('exe line id: ' + ufrid);
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
