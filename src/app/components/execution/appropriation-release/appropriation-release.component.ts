import { Component, OnInit, ViewChild } from '@angular/core';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../header/header.component';
import { PBService } from '../../../generated/api/pB.service'
import { MyDetailsService } from '../../../generated/api/myDetails.service'
import { ExecutionService } from '../../../generated/api/execution.service'
import { PB } from '../../../generated/model/pB'
import { Execution } from '../../../generated/model/execution';
import { Router, ActivatedRoute } from '@angular/router';
import { ExecutionLine, ExecutionTransfer } from '../../../generated';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'appropriation-release',
  templateUrl: './appropriation-release.component.html',
  styleUrls: ['./appropriation-release.component.scss']
})


export class AppropriationReleaseComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private updatelines: ExecutionLine[] = [];
  private phase: Execution;
  private reason: string;
  private etype: string;
  private other: string;
  private longname: string;

  constructor(private exesvc: ExecutionService, private route: ActivatedRoute) { }

  ngOnInit() {
    
    this.route.params.subscribe(data => {
      this.exesvc.getById(data.phaseId).subscribe(d2 => {
        this.phase = d2.result;
      });
    });
  }

  submit() {
    var et: ExecutionTransfer = {
      toIdAmtLkp: {},
      eventType: this.etype,
      other: this.other,
      reason: this.reason,
      longname: this.longname
    };
    this.updatelines.forEach(l => {
      et.toIdAmtLkp[l.id] = l.released; // FIXME: this is just a placeholder
    });

    this.exesvc.createRelease(this.phase.id, new Blob(["stuff"]),
      new Blob([JSON.stringify(et)])).subscribe();
  }
}
