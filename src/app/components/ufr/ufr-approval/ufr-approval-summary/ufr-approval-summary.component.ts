import { UserUtils } from '../../../../services/user.utils';
import { Component, OnInit, ViewChild, ChangeDetectorRef, DoCheck } from '@angular/core';
import { JHeaderComponent } from '../../../header/j-header/j-header.component';
import { POMService, Pom, User } from '../../../../generated/index';
import {AllUfrsComponent} from "../../ufr-search/all-ufrs/all-ufrs.component";
import {UFRFilter, UfrStatus} from "../../../../generated";
import {CurrentPhase} from "../../../../services/current-phase.service";
import {PhaseType} from "../../../programming/select-program-request/UiProgramRequest";

@Component({
  selector: 'ufr-approval-summary',
  templateUrl: './ufr-approval-summary.component.html',
  styleUrls: ['./ufr-approval-summary.component.scss']
})
export class UfrApprovalSummaryComponent implements OnInit, DoCheck {
  @ViewChild(JHeaderComponent) header;
  @ViewChild(AllUfrsComponent) allUfrsComponent: AllUfrsComponent;

  private user: User;
  private mapCycleIdToFy = new Map<string, string>();
  private pom: Pom;
  ufrFilter: UFRFilter;
  PhaseType = PhaseType;

  constructor(private userUtils: UserUtils,
              private pomService: POMService,
              private changeDetectorRef : ChangeDetectorRef,
              private currentPhase: CurrentPhase) {}

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();

    this.pom = (await this.currentPhase.pom().toPromise());
    this.ufrFilter = {
      cycle: 'POM' + this.pom.fy,
      yoe: false,
      status: [UfrStatus.SUBMITTED, UfrStatus.VALID, UfrStatus.INVALID]
    };

    const poms = await this.pomService.getAll().toPromise();
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
