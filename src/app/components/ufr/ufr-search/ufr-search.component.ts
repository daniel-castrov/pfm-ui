import { AllUfrsComponent } from './all-ufrs/all-ufrs.component';
import { FilterUfrsComponent } from './filter-ufrs/filter-ufrs.component';
import { UserUtils } from './../../../services/user.utils.service';
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
  @ViewChild(FilterUfrsComponent) filterUfrsComponent: FilterUfrsComponent;
  @ViewChild(AllUfrsComponent) allUfrsComponent: AllUfrsComponent;
  
  private user: User;

  private cycles: string[] = [];
  private cyclelkp: Map<string, string> = new Map<string, string>();
  private editable: boolean = false;

  constructor(private userUtils: UserUtils,
              private pomService: POMService, 
              private pbService: PBService,
              private changeDetectorRef : ChangeDetectorRef ) {}

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();
    
    const forkJoinResult: RestResult[] = await forkJoin([
      this.pomService.getByCommunityId(this.user.currentCommunityId),
      this.pbService.getByCommunityId(this.user.currentCommunityId)
    ]).toPromise();
    
    this.editable = false; // this.initCycles() changes it
    this.initCyclesAndEditable(forkJoinResult[0].result, forkJoinResult[1].result);
  }
  
  ngDoCheck() {
    this.changeDetectorRef.detectChanges();
  }

  private initCyclesAndEditable(poms: Pom[], pbs: PB[]) {
    const phases: Cycle[] = [];

    poms.forEach((pom: Pom) => {
      phases.push({ fy: pom.fy, phase: 'POM' });
      this.cyclelkp.set(pom.id, 'POM ' + pom.fy);
      if ('CREATED' === pom.status || 'OPEN' === pom.status) {
        this.editable = true;
      }
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

  search() {
    this.allUfrsComponent.search();
  }

}
