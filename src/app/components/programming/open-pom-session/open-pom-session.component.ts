import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {  HeaderComponent } from '../../header/header.component'
import { UserUtils } from '../../../services/user.utils';
import { ProgramAndPrService } from '../../../services/program-and-pr.service';
import { User, Pom, Program, POMService, PBService } from '../../../generated';
import { Notify } from '../../../utils/Notify';

@Component({
  selector: 'app-open-pom-session',
  templateUrl: './open-pom-session.component.html',
  styleUrls: ['./open-pom-session.component.scss']
})

export class OpenPomSessionComponent implements OnInit {

  @ViewChild(HeaderComponent) header: HeaderComponent;

  private pom:Pom;
  private pomPrograms:Program[];
  private pbPrograms:Program[];
  private pb;
  private by;
  private currentCommunityId:string;

  private allPrsSubmitted:boolean;
  private pomStatusIsCreated:boolean;

  constructor(
    private pomService: POMService,
    private pbService: PBService,
    private globalsService: UserUtils,
    private router: Router,
    private programAndPrService: ProgramAndPrService ) {}

  async ngOnInit() {

    this.globalsService.user().subscribe(async usr =>{
      const user:User = usr;
      this.currentCommunityId = user.currentCommunityId;

      await this.initPomPrs();

      if ( !this.pom || null==this.pom ){
        this.pomStatusIsCreated = false;
        Notify.error('No POM Session in the "CREATED" state was found');
      } else {

        await this.initPbPrs();

        this.by = this.pom.fy;
        this.allPrsSubmitted = true;
        for ( var i = 0; i< this.pomPrograms.length; i++ ){
          if ( this.pomPrograms[i].programStatus  != "SUBMITTED" ){
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
            this.pomPrograms = (await this.programAndPrService.programRequests(this.pom.id));
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
    this.pbPrograms = (await this.programAndPrService.programRequests(this.pb.id));
  }

  openPom( event ) {
    if (this.allPrsSubmitted) {
      this.pomService.open(this.pom.id).subscribe(data => {
        this.pomStatusIsCreated = false;
        Notify.success('The POM Session is now OPEN');
        this.header.refresh();
        this.router.navigate(['/home']);
      });
    }
  }
}
