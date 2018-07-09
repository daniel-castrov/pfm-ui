import { MyDetailsService } from './../../../generated/api/myDetails.service';
import { POMService } from './../../../generated/api/pOM.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { Pom } from '../../../generated/model/pom';
import { User } from '../../../generated/model/user';
import { RestResult } from '../../../generated/model/restResult';
import { Program } from '../../../generated/model/program';
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

  @ViewChild(HeaderComponent) header;
  private by: number = new Date().getFullYear() + 2;
  private pom: Pom;
  private pomProgrammaticRequests: ProgrammaticRequest[];
  private pb: PB;
  private pbProgrammaticRequests: ProgrammaticRequest[];
  private thereAreOutstandingPRs: boolean;
  private editview:boolean = false;

  constructor(private myDetailsService: MyDetailsService,
              private pomService: POMService,
              private pbService: PBService,
              private prService: PRService,
              private router: Router,
              private route: ActivatedRoute,
  ) {
    this.route.params.subscribe((params: Params) => {
      console.log( params.view );
      if ( params.view === "edit" ){
        this.editview = true;
      }
      console.log( this.editview );
    });
  }

  async ngOnInit() {
    const user: User = (await this.myDetailsService.getCurrentUser().toPromise()).result;
    await Promise.all([this.initPomPrs(user),this.initPbPrs(user)]);
    this.thereAreOutstandingPRs = this.pomProgrammaticRequests.filter(pr => pr.state === 'OUTSTANDING').length > 0;
  }

  initPomPrs(user: User): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // can't use getOpen here, because we need to handle open *or* created pom
      this.pomService.getByCommunityId(user.currentCommunityId).subscribe(poms => { 
        for (var i = 0; i < poms.result.length; i++){
          var pom: Pom = poms.result[i];
          if ('CREATED' === pom.status || 'OPEN' === pom.status) {
            this.pom = pom;
            this.pom.fy = pom.fy;
            this.prService.getByPhase(this.pom.id).subscribe(prrslt => { 
              this.pomProgrammaticRequests = prrslt.result;
              resolve();
            });

            break;
          }
        }
      });
    });
  }

  initPbPrs(user: User): Promise<any> {
    return new Promise( async (resolve, reject) => {
      this.pb = (await this.pbService.getLatest(user.currentCommunityId).toPromise()).result;
      this.pbProgrammaticRequests = (await this.prService.getByPhase(this.pb.id).toPromise()).result;
      resolve();
    });
  }

  async submit() {
    await this.pomService.submit(this.pom.id).toPromise();
    this.ngOnInit();
  }
}
