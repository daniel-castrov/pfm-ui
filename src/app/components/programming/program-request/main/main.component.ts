import { ProgrammaticRequest } from './../../../../generated/model/programmaticRequest';
import { PRService } from './../../../../generated/api/pR.service';
import { Component, OnInit, ViewChild, Input } from '@angular/core';

// Other Components
import { ProgramRequestPageModeService } from '../page-mode/page-mode.service';


@Component({
  selector: 'program-request',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class ProgramRequestComponent implements OnInit {

  private pr: ProgrammaticRequest = {};

  constructor(
    private prService: PRService,
    private programRequestPageMode: ProgramRequestPageModeService ) {}

  async ngOnInit() {
    if(this.programRequestPageMode.id) {
      this.pr = (await this.prService.getById(this.programRequestPageMode.id).toPromise()).result;
    }
  }

  submit() {
    this.pr.state = 'SUBMITTED';
    this.save();
  }

  async save() {
    if(this.pr.id) {
      this.pr = (await this.prService.save(this.pr.id, this.pr).toPromise()).result;
    } else {
      this.pr.phaseId = this.programRequestPageMode.phaseId;
      this.pr.originalMrId = this.programRequestPageMode.originatingProgramId;
      this.pr.parentMrId = this.programRequestPageMode.parentId;
      this.pr.bulkOrigin = false;
      this.pr.state = 'OUTSTANDING';
      if(this.programRequestPageMode.newProgram) this.pr.type = 'PROGRAM';
      if(this.programRequestPageMode.newSubprogram) this.pr.type = 'SUBPROGRAM';
      this.pr = (await this.prService.create(this.pr).toPromise()).result;
    }
  }
}
