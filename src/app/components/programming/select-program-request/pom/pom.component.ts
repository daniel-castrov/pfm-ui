import { ProgramRequestWithFullName } from './../../../../services/with-full-name.service';
import { UiProgrammaticRequest } from './../UiProgrammaticRequest';
import { Component, Input, OnChanges } from '@angular/core';
import { Pom } from '../../../../generated/model/pom';

@Component({
  selector: 'j-pom',
  templateUrl: './pom.component.html',
  styleUrls: ['./pom.component.scss']
})
export class PomComponent implements OnChanges {
  
  @Input() private pomProgrammaticRequests: ProgramRequestWithFullName[];
  @Input() private pbProgrammaticRequests: ProgramRequestWithFullName[];
  @Input() private pom: Pom;
  @Input() private by: number;

  baseline = {};
  pomRequests = {};
  allocatedToas = {};
  difference = {};

  ngOnChanges() {

    if(this.pbProgrammaticRequests && this.pomProgrammaticRequests && this.pom) {
      this.by = this.pom.fy;
      for(let year:number=this.by; year<this.by+5; year++) {
        this.baseline[year] = this.aggregate(this.pbProgrammaticRequests, year);
      }

      for(let year:number=this.by; year<this.by+5; year++) {
        this.pomRequests[year] = this.aggregate(this.pomProgrammaticRequests, year);
      }

      this.pom.communityToas.forEach( (toa)=> {
        this.allocatedToas[toa.year] = toa.amount;
      });

      for(let year:number=this.by; year<this.by+5; year++) {
        this.difference[year] = this.allocatedToas[year] - this.pomRequests[year];
      }
    }
  }

  aggregate(prs: ProgramRequestWithFullName[], year: number): number {
    return prs.map(pr => new UiProgrammaticRequest(pr).getToa(year)).reduce((a,b)=>a+b);
  }
}
