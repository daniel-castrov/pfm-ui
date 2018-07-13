import { NewProgrammaticRequestComponent } from './new-programmatic-request/new-programmatic-request.component';
import { ProgramRequestWithFullName, WithFullNameService } from './../../../services/with-full-name.service';
import { GlobalsService } from './../../../services/globals.service';
import { POMService } from './../../../generated/api/pOM.service';
import { Component, OnInit, ViewChild } from '@angular/core';

// Other Components
import { Pom } from '../../../generated/model/pom';
import { PRService } from '../../../generated/api/pR.service';
import { ProgrammaticRequest } from '../../../generated/model/programmaticRequest';
import { PB } from '../../../generated/model/pB';
import { PBService } from '../../../generated/api/pB.service';

@Component({
  selector: 'app-select-program-request',
  templateUrl: './select-program-request.component.html',
  styleUrls: ['./select-program-request.component.scss']
})
export class SelectProgramRequestComponent implements OnInit {

  @ViewChild(NewProgrammaticRequestComponent) newProgrammaticRequestComponent: NewProgrammaticRequestComponent;
  private currentCommunityId: string;
  private pom: Pom;
  private pomProgrammaticRequests: ProgramRequestWithFullName[];
  private pb: PB;
  private pbProgrammaticRequests: ProgrammaticRequest[];
  private thereAreOutstandingPRs: boolean;

  constructor(private pomService: POMService,
              private pbService: PBService,
              private prService: PRService,
              private withFullNameService: WithFullNameService,
              private globalsService: GlobalsService
  ) {}

  async ngOnInit() {
    this.currentCommunityId = (await this.globalsService.user().toPromise()).currentCommunityId;
    this.initPbPrs();
    this.reloadPrs();
  }

  async reloadPrs() {
    await this.initPomPrs();
    this.thereAreOutstandingPRs = this.pomProgrammaticRequests.filter(pr => pr.state === 'OUTSTANDING').length > 0;
  }

  initPomPrs(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // can't use getOpen here, because we need to handle open *or* created pom
      this.pomService.getByCommunityId(this.currentCommunityId).subscribe(async poms => { 
        for (var i = 0; i < poms.result.length; i++){
          var pom: Pom = poms.result[i];
          if ('CREATED' === pom.status || 'OPEN' === pom.status) {
            this.pom = pom;
            this.pomProgrammaticRequests = (await this.withFullNameService.programRequests(this.pom.id));
            resolve();
            break;
          }
        }
      });
    });
  }

  async initPbPrs() {
    this.pb = (await this.pbService.getLatest(this.currentCommunityId).toPromise()).result;
    this.pbProgrammaticRequests = (await this.prService.getByPhase(this.pb.id).toPromise()).result;
  }

  onDeletePr() {
    this.reloadPrs();
    this.newProgrammaticRequestComponent.addNewPrFor = null;
  }

  async submit() {
    await this.pomService.submit(this.pom.id).toPromise();
    this.reloadPrs();
  }
}
