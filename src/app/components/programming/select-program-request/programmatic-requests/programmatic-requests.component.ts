import { Component, Input } from '@angular/core';
import { Program } from '../../../../generated/model/program';
import { ProgrammaticRequest } from '../../../../generated/model/programmaticRequest';

@Component({
  selector: 'programmatic-requests',
  templateUrl: './programmatic-requests.component.html',
  styleUrls: ['./programmatic-requests.component.scss']
})
export class ProgrammaticRequestsComponent {

  @Input() private programmaticRequests: ProgrammaticRequest[];
  @Input() private by: number;

  constructor() {}

}
