import { CycleUtils } from './../../../services/cycle.utils';
import { NewProgramComponent } from './new-program-request/new-program-request.component';
import { ProgramRequestWithFullName, WithFullNameService } from '../../../services/with-full-name.service';
import { UserUtils } from '../../../services/user.utils';
import { POMService } from '../../../generated/api/pOM.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Pom, PB, PBService, RestResult } from '../../../generated';
import {Notify} from "../../../utils/Notify";

@Component({
  selector: 'app-select-program-request',
  templateUrl: './select-program-request.component.html',
  styleUrls: ['./select-program-request.component.scss']
})
export class SelectProgramRequestComponent implements OnInit {

  @ViewChild(NewProgramComponent) newProgramComponent: NewProgramComponent;
  private currentCommunityId: string;
  public pom: Pom;
  public pomPrograms: ProgramRequestWithFullName[];
  public pb: PB;
  public pbPrograms: ProgramRequestWithFullName[];
  public thereAreOutstandingPRs: boolean;

  constructor(private pomService: POMService,
              private pbService: PBService,
              private withFullNameService: WithFullNameService,
              private userUtils: UserUtils,
              private cycleUtils: CycleUtils) {}

  async ngOnInit() {
    this.currentCommunityId = (await this.userUtils.user().toPromise()).currentCommunityId;
    this.initPbPrs();
    this.reloadPrs();
  }

  async reloadPrs() {
    await this.initPomPrs();
    this.thereAreOutstandingPRs = this.pomPrograms.filter(pr => pr.programStatus === 'OUTSTANDING').length > 0;
  }

  initPomPrs(): Promise<void> {
    return new Promise(async (resolve) => {
      this.pom = await this.cycleUtils.currentPom().toPromise();
      this.pomPrograms = (await this.withFullNameService.programRequestsWithFullNamesDerivedFromCreationTimeData(this.pom.id));
      resolve();
    });
  }

  async initPbPrs() {
    this.pb = (await this.pbService.getLatest(this.currentCommunityId).toPromise()).result;
    this.pbPrograms = (await this.withFullNameService.programRequestsWithFullNamesDerivedFromArchivalData(this.pb.id));
  }

  onDeletePr() {
    this.reloadPrs();
    this.newProgramComponent.addNewPrForMode = null;
  }

  async submit() {
    let data:RestResult = await this.pomService.submit(this.pom.id).toPromise();
    if (data.error) {
      Notify.error('No Program requests were submitted.\n' + data.error);
    } else {
      Notify.success('All Program requests were submitted.\n' + data.result);
      this.reloadPrs();
    } 
  }
}
