import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../header/header.component'
import { UserUtils } from '../../../services/user.utils';
import { WithFullNameService } from '../../../services/with-full-name.service';
import { ProgramRequestWithFullName } from '../../../services/with-full-name.service';
import {User, Pom, ProgrammaticRequest, POMService, PBService, PRService} from '../../../generated';
import { Notify } from '../../../utils/Notify';

@Component({
  selector: 'close-pom-session',
  templateUrl: './close-pom-session.component.html'
})

export class ClosePomSessionComponent implements OnInit {

  @ViewChild(HeaderComponent) header: HeaderComponent;

  pom:Pom;
  pb;
  by;
  pomProgrammaticRequests:ProgramRequestWithFullName[];
  pbProgrammaticRequests:ProgrammaticRequest[];


  private currentCommunityId:string;
  private allPrsSubmitted:boolean;

  constructor(
    private pomService: POMService,
    private pbService: PBService,
    private prService: PRService,
    private globalsService: UserUtils,
    private router: Router,
    private withFullNameService: WithFullNameService ) {}

  async ngOnInit() {

    this.globalsService.user().subscribe(async usr =>{
      const user:User = usr;
      this.currentCommunityId = user.currentCommunityId;

      this.pom = (await this.pomService.getReconciliation(user.currentCommunityId).toPromise()).result as Pom;
      this.pomProgrammaticRequests = (await this.withFullNameService.programRequestsWithFullNamesDerivedFromCreationTimeData(this.pom.id));

      await this.initPbPrs();

      this.by = this.pom.fy;
      this.allPrsSubmitted = true;
      for ( var i = 0; i< this.pomProgrammaticRequests.length; i++ ){
        if ( this.pomProgrammaticRequests[i].state  != "SUBMITTED" ){
          this.allPrsSubmitted = false;
          break;
        }
      }
    });
  }

  async initPbPrs() {
    this.pb = (await this.pbService.getLatest(this.currentCommunityId).toPromise()).result;
    this.pbProgrammaticRequests = (await this.withFullNameService.programRequestsWithFullNamesDerivedFromArchivalData(this.pb.id));
  }

  closePom( event ) {
    if (this.allPrsSubmitted) {
      this.pomService.updatePomStatus(this.pom.id, Pom.StatusEnum.CLOSED).subscribe(response => {
        this.prService.updateMrdb(this.pom.id).subscribe(response => {
          Notify.success('The POM Session is now CLOSED');
          this.header.refreshActions();
          this.router.navigate(['/home']);
        });
      })
    }
  }
}
