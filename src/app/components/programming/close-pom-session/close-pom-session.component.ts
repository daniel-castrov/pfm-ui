import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../header/header.component'
import { UserUtils } from '../../../services/user.utils';
import { ProgramAndPrService } from '../../../services/program-and-pr.service';
import {User, Pom, Program, POMService, PBService, PRService} from '../../../generated';
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
  pomPrograms:Program[];
  pbPrograms:Program[];


  private currentCommunityId:string;
  private allPrsSubmitted:boolean;

  constructor(
    private pomService: POMService,
    private pbService: PBService,
    private prService: PRService,
    private globalsService: UserUtils,
    private router: Router,
    private programAndPrService: ProgramAndPrService ) {}

  async ngOnInit() {

    this.globalsService.user().subscribe(async usr =>{
      const user:User = usr;
      this.currentCommunityId = user.currentCommunityId;

      this.pom = (await this.pomService.getReconciliation(user.currentCommunityId).toPromise()).result as Pom;
      this.pomPrograms = (await this.programAndPrService.programRequests(this.pom.id));

      await this.initPbPrs();

      this.by = this.pom.fy;
      this.allPrsSubmitted = true;
      for ( var i = 0; i< this.pomPrograms.length; i++ ){
        if ( this.pomPrograms[i].programStatus  != "SUBMITTED" ){
          this.allPrsSubmitted = false;
          break;
        }
      }
    });
  }

  async initPbPrs() {
    this.pb = (await this.pbService.getFinalLatest().toPromise()).result;
    this.pbPrograms = (await this.programAndPrService.programRequests(this.pb.id));
  }

  closePom( event ) {
    if (this.allPrsSubmitted) {
      this.pomService.updatePomStatus(this.pom.id, Pom.StatusEnum.CLOSED).subscribe(response => {
        Notify.success('The POM Session is now CLOSED');
        this.header.refresh();
        this.router.navigate(['/home']);
      })
    }
  }
}
