import { Component, OnInit, ViewChild } from '@angular/core';
import {  HeaderComponent } from '../../header/header.component'
import { UserUtils } from '../../../services/user.utils';
import { WithFullNameService } from '../../../services/with-full-name.service';
import { ProgramRequestWithFullName } from '../../../services/with-full-name.service';
import { User, Pom, ProgrammaticRequest, POMService, PBService } from '../../../generated';
import { NotifyUtil } from '../../../utils/NotifyUtil';

@Component({
  selector: 'app-open-pom-session',
  templateUrl: './open-pom-session.component.html',
  styleUrls: ['./open-pom-session.component.scss']
})

export class OpenPomSessionComponent implements OnInit {

  @ViewChild(HeaderComponent) header: HeaderComponent;

  private pom:Pom;
  private pomProgrammaticRequests:ProgramRequestWithFullName[];
  private pbProgrammaticRequests:ProgrammaticRequest[];
  private pb;
  private by;
  private currentCommunityId:string;

  private allPrsSubmitted:boolean;
  private pomStatusIsCreated:boolean;

  constructor(
    private pomService: POMService,
    private pbService: PBService,
    private globalsService: UserUtils,
    private withFullNameService: WithFullNameService ) {}

  async ngOnInit() {

    this.globalsService.user().subscribe(async usr =>{
      const user:User = usr;
      this.currentCommunityId = user.currentCommunityId;

      await this.initPomPrs();

      if ( !this.pom || null==this.pom ){
        this.pomStatusIsCreated = false;
        NotifyUtil.notifyError('No POM Session in the "CREATED" state was found');
      } else {

        await this.initPbPrs();

        this.by = this.pom.fy;
        this.allPrsSubmitted = true;
        for ( var i = 0; i< this.pomProgrammaticRequests.length; i++ ){
          if ( this.pomProgrammaticRequests[i].state  != "SUBMITTED" ){
            this.allPrsSubmitted = false;
            break;
          }
        }
      }
    });
  }

  initPomPrs(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.pomService.getByCommunityId(this.currentCommunityId).subscribe(async poms => {
        for (var i = 0; i < poms.result.length; i++){
          var pom: Pom = poms.result[i];
          if ('CREATED' === pom.status) {
            this.pom = pom;
            this.pomStatusIsCreated = true;
            this.pomProgrammaticRequests = (await this.withFullNameService.programRequestsWithFullNamesDerivedFromCreationTimeData(this.pom.id));
            resolve();
            break;
          }
        }
        resolve();
      });
    });
  }

  async initPbPrs() {
    this.pb = (await this.pbService.getLatest(this.currentCommunityId).toPromise()).result;
    this.pbProgrammaticRequests = (await this.withFullNameService.programRequestsWithFullNamesDerivedFromArchivalData(this.pb.id));
  }

  openPom( event ) {
    if (this.allPrsSubmitted) {
      this.pomService.open(this.pom.id).subscribe(data => {
        this.pomStatusIsCreated = false;
        NotifyUtil.notifySuccess('The POM Session is now OPEN');
        this.header.refreshActions();
      });
    }
  }
}
