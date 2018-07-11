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
import { forkJoin } from 'rxjs/observable/forkJoin';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'charges',
  templateUrl: './charges.component.html',
  styleUrls: ['./charges.component.scss']
})
export class ChargesComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  private updatelines: ExecutionLine[] = [];
  private phase: Execution;

  constructor(private exesvc: ExecutionService, private route: ActivatedRoute) { }

  ngOnInit() {

    this.route.params.subscribe(data => {
      this.exesvc.getById(data.phaseId).subscribe(d2 => {
        this.phase = d2.result;
      });
    });
  }
}
