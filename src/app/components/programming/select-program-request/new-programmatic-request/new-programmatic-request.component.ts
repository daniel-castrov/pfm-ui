import { Router } from '@angular/router';
import { ProgrammaticRequest } from './../../../../generated/model/programmaticRequest';
import { Component, Input } from '@angular/core';

// Other Components
import { Pom } from '../../../../generated/model/pom';
import { ProgramRequestPageModeService } from '../../program-request/page-mode/page-mode.service';

@Component({
  selector: 'new-programmatic-request',
  templateUrl: './new-programmatic-request.component.html',
  styleUrls: ['./new-programmatic-request.component.scss']
})
export class NewProgrammaticRequestComponent {

  radio: string;
  @Input() pom: Pom;

  constructor(
    private router: Router,
    private programRequestPageMode: ProgramRequestPageModeService
  ) {}

  async next() {
    switch(this.radio) {
      case 'ProgramOfRecord':
        this.programRequestPageMode.setProgramOfRecord(this.pom.id);
        break;
      case 'NewSubprogram':
        this.programRequestPageMode.setNewSubprogram(this.pom.id);
        break;
      case 'NewProgram':
        this.programRequestPageMode.setNewProgram(this.pom.id);
    }
    this.router.navigate(['/program-request']);
  }

  // const pr: ProgrammaticRequest = (await this.prService.create(this.createPR()).toPromise()).result;
  // private createPR() {
  //   const pr: ProgrammaticRequest = new Object();
  //   pr.phaseId = this.pom.id;
  //   pr.bulkOrigin = false;
  //   pr.state = 'OUTSTANDING';
  //   pr.type = 'PROGRAM';
  //   return pr;
  // }
}
