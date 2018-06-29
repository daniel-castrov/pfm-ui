import { Component, OnInit, ViewChild } from '@angular/core';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { PBService } from '../../../generated/api/pB.service'
import { MyDetailsService } from '../../../generated/api/myDetails.service'
import { ExecutionService } from '../../../generated/api/execution.service'
import { PB } from '../../../generated/model/pB'
import { Execution } from '../../../generated/model/execution';
import { Router } from '@angular/router';

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
  private fileToUpload: File = null;

  constructor(private pbsvc: PBService, private usvc: MyDetailsService,
  private esvc:ExecutionService, private router:Router ) { }

  ngOnInit() {
    var fn = function(e) {
			if (!/zmore/.test(e.target.className)) { $('#dmore').hide(); }
		}
		document.addEventListener('click', fn);
		document.addEventListener('touchstart', fn);

    this.usvc.getCurrentUser().subscribe(p => {
      this.pbsvc.getByCommunityId(p.result.currentCommunityId).subscribe(data => {
        data.result.forEach((pb: PB) => {
          this.yearpblkp.set(pb.fy, pb);
          this.modelpb = pb;
        });
      });
    });
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    console.log(this.fileToUpload);
  }


  submit() {
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
