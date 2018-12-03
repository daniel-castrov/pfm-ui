import { Component, OnInit, ViewChild } from '@angular/core';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../header/header.component';
import { PBService } from '../../../generated/api/pB.service'
import { MyDetailsService } from '../../../generated/api/myDetails.service'
import { ExecutionService } from '../../../generated/api/execution.service'
import { PB } from '../../../generated/model/pB'
import { Execution } from '../../../generated/model/execution';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs/observable/forkJoin';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'create-execution-phase',
  templateUrl: './create-execution-phase.component.html',
  styleUrls: ['./create-execution-phase.component.scss']
})
export class CreateExecutionPhaseComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  private yearpblkp: Map<number, PB> = new Map<number, PB>();
  private modelpb: PB;
  private message: string;
  private fileToUpload: File;
  private submitted: boolean = false;

  constructor(private pbsvc: PBService, private usvc: MyDetailsService,
  private esvc:ExecutionService, private router:Router ) { }

  ngOnInit() {
    var fn = function(e) {
			if (!/zmore/.test(e.target.className)) { $('#dmore').hide(); }
		}
		document.addEventListener('click', fn);
		document.addEventListener('touchstart', fn);

    this.usvc.getCurrentUser().subscribe(p => {
      forkJoin([
        this.pbsvc.getByCommunityId(p.result.currentCommunityId),
        this.esvc.getByCommunityId(p.result.currentCommunityId)
      ]).subscribe(data => {
        var existingExeYears: Set<number> = new Set<number>();
        data[1].result.forEach((exe: Execution) => {
          existingExeYears.add(exe.fy);
        });
        
        data[0].result.forEach((pb: PB) => {
          if (!existingExeYears.has(pb.fy)) {
            this.yearpblkp.set(pb.fy, pb);
            this.modelpb = pb;
          }
        });

        if (this.yearpblkp.size < 1) {
          this.message = 'All available Execution Phases have been created';
        }

      });
    });
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }


  submit() {
    this.submitted = true;
    var my: CreateExecutionPhaseComponent = this;

    this.esvc.createExecution(this.modelpb.communityId, this.modelpb.fy, this.fileToUpload,
      this.modelpb.id ).subscribe(data => {
      if (data.result) {
        my.router.navigate(['/home']);
      }
      else {
        my.message = data.error;
      }
    });
  }
}
