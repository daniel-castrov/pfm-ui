import { UserUtils } from '../../../../services/user.utils';
import { Component, OnInit, ViewChild, ChangeDetectorRef, DoCheck } from '@angular/core';
import { HeaderComponent } from '../../../header/header.component';
import { POMService, Pom, User } from '../../../../generated/index';
import {AllUfrsComponent} from "../../ufr-search/all-ufrs/all-ufrs.component";
import {UFRFilter, UfrStatus} from "../../../../generated";
import {CycleUtils} from "../../../../services/cycle.utils";

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
  private pom: Pom;
  ufrFilter: UFRFilter;

  constructor(private userUtils: UserUtils,
              private pomService: POMService,
              private changeDetectorRef : ChangeDetectorRef,
              private cycleUtils: CycleUtils) {}

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();

    this.pom = (await this.cycleUtils.currentPom().toPromise());
    this.ufrFilter = {
      cycle: 'POM' + this.pom.fy,
      yoe: false,
      status: [UfrStatus.SUBMITTED, UfrStatus.VALID, UfrStatus.INVALID]
    };

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
