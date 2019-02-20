import { Component, OnInit, ViewChild, ChangeDetectorRef, DoCheck } from '@angular/core';
import {HeaderComponent} from "../../header/header.component";
import {AllUfrsComponent} from "../ufr-search/all-ufrs/all-ufrs.component";
import {Execution, ExecutionService, Pom, POMService, UFRFilter, User} from "../../../generated";
import {UserUtils} from "../../../services/user.utils";

@Component({
  selector: 'ufr-yoe-summary',
  templateUrl: './ufr-yoe-summary.component.html',
  styleUrls: ['./ufr-yoe-summary.component.scss']
})

export class UfrYoeSummaryComponent implements OnInit, DoCheck {
  @ViewChild(HeaderComponent) header;
  @ViewChild(AllUfrsComponent) allUfrsComponent: AllUfrsComponent;

  private user: User;
  private mapCycleIdToFy = new Map<string, string>();
  private execution: Execution;
  ufrFilter: UFRFilter;

  constructor(private userUtils: UserUtils,
              private pomService: POMService,
              private changeDetectorRef : ChangeDetectorRef,
              private exeService: ExecutionService) {}

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();

    this.execution = (await this.exeService.getAll(Execution.StatusEnum.CREATED).toPromise()).result;
    this.ufrFilter = {
      cycle: 'POM' + this.execution[0].fy,
      yoe: true};

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
