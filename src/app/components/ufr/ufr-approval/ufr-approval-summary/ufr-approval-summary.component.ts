import { UserUtils } from '../../../../services/user.utils';
import { Component, OnInit, ViewChild, ChangeDetectorRef, DoCheck } from '@angular/core';
import { HeaderComponent } from '../../../header/header.component';
import { POMService, Pom, User } from '../../../../generated/index';
import {AllUfrsComponent} from "../../ufr-search/all-ufrs/all-ufrs.component";

@Component({
  selector: 'ufr-approval-summary',
  templateUrl: './ufr-approval-summary.component.html',
  styleUrls: ['./ufr-approval-summary.component.scss']
})
export class UfrApprovalSummaryComponent implements OnInit, DoCheck {
  @ViewChild(HeaderComponent) header;
  @ViewChild(AllUfrsComponent) allUfrsComponent: AllUfrsComponent;

  private user: User;
  private mapCycleIdToFy = new Map<string, string>();

  constructor(private userUtils: UserUtils,
              private pomService: POMService,
              private changeDetectorRef : ChangeDetectorRef ) {}

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();

    const poms = await this.pomService.getByCommunityId(this.user.currentCommunityId).toPromise();
    this.initCyclesAndEditable(poms.result);
  }
  
  ngDoCheck() {
    this.changeDetectorRef.detectChanges();
  }

  private initCyclesAndEditable(poms: Pom[]) {
    poms.forEach((pom: Pom) => {
      this.mapCycleIdToFy.set(pom.id, 'POM ' + pom.fy);
    });
  }
}
