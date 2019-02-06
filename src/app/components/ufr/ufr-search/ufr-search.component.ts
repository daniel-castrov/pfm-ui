import { AllUfrsComponent } from './all-ufrs/all-ufrs.component';
import { UserUtils } from '../../../services/user.utils';
import { Component, OnInit, ViewChild, ChangeDetectorRef, DoCheck } from '@angular/core';
import { forkJoin } from "rxjs/observable/forkJoin";
import { HeaderComponent } from '../../header/header.component';
import { POMService, PBService, Pom, PB, User, RestResult } from '../../../generated';
import { Cycle } from '../cycle';

@Component({
  selector: 'app-ufr-search',
  templateUrl: './ufr-search.component.html',
  styleUrls: ['./ufr-search.component.scss']
})
export class UfrSearchComponent implements OnInit, DoCheck {
  @ViewChild(HeaderComponent) header; 
  @ViewChild(AllUfrsComponent) allUfrsComponent: AllUfrsComponent;
  
  public pom: Pom;
  private user: User;

  private cycles: string[] = [];
  private mapCycleIdToFy = new Map<string, string>();

  constructor(private userUtils: UserUtils,
              private pomService: POMService, 
              private pbService: PBService,
              private changeDetectorRef : ChangeDetectorRef ) {}

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();
    
    const [poms, pbs] = (await forkJoin([ this.pomService.getByCommunityId(this.user.currentCommunityId),
                                          this.pbService.getByCommunityId(this.user.currentCommunityId) ]).toPromise())
                    .map( (restResult: RestResult) => restResult.result);
    
    this.initCyclesAndEditable(poms, pbs);
  } 
  
  ngDoCheck() {
    this.changeDetectorRef.detectChanges();
  }

  private initCyclesAndEditable(poms: Pom[], pbs: PB[]) {
    const phases: Cycle[] = [];

    poms.forEach((pom: Pom) => {
      phases.push({ fy: pom.fy, phase: 'POM' });
      this.mapCycleIdToFy.set(pom.id, 'POM ' + pom.fy);
    });

    pbs.forEach((pb: PB) => {
      phases.push({ fy: pb.fy, phase: 'PB' });
    });
  
    phases.sort((cycle1: Cycle, cycle2: Cycle) => {
      if (cycle1.fy === cycle2.fy) {
        if (cycle1.phase === cycle2.phase) {
          return 0;
        }
        return (cycle1.phase < cycle2.phase ? -1 : 1);
      }
      else {
        return cycle1.fy - cycle2.fy;
      }
    });
    phases.forEach((cycle: Cycle) => {
      this.cycles.push(cycle.phase + ' ' + (cycle.fy - 2000));
    });
  }
}
