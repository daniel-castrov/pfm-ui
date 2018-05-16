import { Component, Input, OnChanges } from '@angular/core';
import { Program } from '../../../../generated/model/program';
import { ProgrammaticRequest } from '../../../../generated/model/programmaticRequest';
import { Row } from './Row';

@Component({
  selector: 'programmatic-requests',
  templateUrl: './programmatic-requests.component.html',
  styleUrls: ['./programmatic-requests.component.scss']
})
export class ProgrammaticRequestsComponent implements OnChanges {

  @Input() private pomProgrammaticRequests: ProgrammaticRequest[];
  @Input() private pbProgrammaticRequests: ProgrammaticRequest[];
  @Input() private by: number;
  private rows = {};

  constructor() {}

  ngOnChanges() {
    if(this.pomProgrammaticRequests) {
      this.pomProgrammaticRequests.forEach( pr => {
        this.rows[pr.shortName]=new Row();
        this.rows[pr.shortName].addPomPr(pr);
      });
    };
    if(this.pbProgrammaticRequests) {
      this.pbProgrammaticRequests.forEach( pr => {
        if(this.rows[pr.shortName]) {
          this.rows[pr.shortName].addPbPr(pr);
        } else {
          this.rows[pr.shortName]=new Row();
          this.rows[pr.shortName].addPbPr(pr);
        }
      });
    };
  }

}
