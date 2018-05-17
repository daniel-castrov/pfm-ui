import { Observable } from 'rxjs/Observable';
import { UiProgrammaticRequest } from './../UiProgrammaticRequest';
import { Component, Input, OnChanges } from '@angular/core';
import { Pom } from '../../../../generated/model/pom';
import { ProgrammaticRequest } from '../../../../generated/model/programmaticRequest';

@Component({
  selector: 'j-pom',
  templateUrl: './pom.component.html',
  styleUrls: ['./pom.component.scss']
})
export class PomComponent implements OnChanges {
  
  @Input() private pomProgrammaticRequests: ProgrammaticRequest[];
  @Input() private pbProgrammaticRequests: ProgrammaticRequest[];
  @Input() private pom: Pom;
  @Input() private by: number;

  baseline = {};
  pomRequests = {};
  allocatedToas = {};
  difference = {};

  ngOnChanges() {

    if(this.pbProgrammaticRequests) {
      for(let year:number=this.by; year<this.by+5; year++) {
        this.baseline[year] = this.aggregate(this.pbProgrammaticRequests, year);
      }
    }

    if(this.pomProgrammaticRequests) {
      for(let year:number=this.by; year<this.by+5; year++) {
        this.pomRequests[year] = this.aggregate(this.pomProgrammaticRequests, year);
      }
    }

    if(this.pom) {
      this.pom.communityToas.forEach( (toa)=> {
        this.allocatedToas[toa.year] = toa.amount;
      });
    }

    for(let year:number=this.by; year<this.by+5; year++) {
      this.difference[year] = this.allocatedToas[year] - this.pomRequests[year];
    }
  
  }

  aggregate(prs: ProgrammaticRequest[], year: number): number {
    return prs.map(pr => new UiProgrammaticRequest(pr).getToa(year)).reduce((a,b)=>a+b);
  }
}
