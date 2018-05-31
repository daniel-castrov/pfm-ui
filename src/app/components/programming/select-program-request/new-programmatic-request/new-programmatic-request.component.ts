import { Router } from '@angular/router';
import { ProgrammaticRequest } from './../../../../generated/model/programmaticRequest';
import { PRService } from './../../../../generated/api/pR.service';
import { Component, Input } from '@angular/core';

// Other Components
import { Pom } from '../../../../generated/model/pom';

@Component({
  selector: 'new-programmatic-request',
  templateUrl: './new-programmatic-request.component.html',
  styleUrls: ['./new-programmatic-request.component.scss']
})
export class NewProgrammaticRequestComponent {

  radio: string;
  @Input() pom: Pom;

  constructor(
    private prService: PRService,
    private router: Router
  ) {}

  async next() {
    switch(this.radio) {
      case 'ExistingProgram':
      case 'NewSubprogram':
        break;
      case 'NewProgram':
        const pr: ProgrammaticRequest = (await this.prService.create(this.createPR()).toPromise()).result;
        this.router.navigate(['/existing-program-request', pr.id])
    }
  }

  private createPR() {
    const pr: ProgrammaticRequest = new Object();
    pr.phaseId = this.pom.id;
    pr.bulkOrigin = false;
    pr.state = 'OUTSTANDING';
    pr.type = 'PROGRAM';
    return pr;
  }
}
