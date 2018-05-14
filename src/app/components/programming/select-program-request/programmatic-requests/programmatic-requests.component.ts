import { Component, Input, OnChanges } from '@angular/core';
import { Program } from '../../../../generated/model/program';
import { ProgrammaticRequest } from '../../../../generated/model/programmaticRequest';
import { UiProgrammaticRequest } from './UiProgrammaticRequest';

@Component({
  selector: 'programmatic-requests',
  templateUrl: './programmatic-requests.component.html',
  styleUrls: ['./programmatic-requests.component.scss']
})
export class ProgrammaticRequestsComponent implements OnChanges {

  @Input() private programmaticRequests: ProgrammaticRequest[];
  @Input() private by: number;
  private uiProgrammaticRequests: UiProgrammaticRequest[];

  constructor() {}

  ngOnChanges() {
    if(this.programmaticRequests) {
      this.uiProgrammaticRequests = this.programmaticRequests.map( (pr) => new UiProgrammaticRequest(pr));
    }
  }

}
