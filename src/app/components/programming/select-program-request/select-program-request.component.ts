import { MyDetailsService } from './../../../generated/api/myDetails.service';
import { POMService } from './../../../generated/api/pOM.service';
import { Component, OnInit, ViewChild } from '@angular/core';

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

  constructor(private myDetailsService: MyDetailsService,
              private pomService: POMService,
              private pbService: PBService,
              private prService: PRService
  ) {}

  async ngOnInit() {
    const user: User = (await this.myDetailsService.getCurrentUser().toPromise()).result;
    await Promise.all([this.initPomPrs(user),this.initPbPrs(user)]);
    this.thereAreOutstandingPRs = this.pomProgrammaticRequests.filter(pr => pr.state === 'OUTSTANDING').length > 0;
  }

  initPomPrs(user: User): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // can't use getOpen here, because we need to handle open *or* created pom
      this.pomService.getByCommunityId(user.currentCommunityId).subscribe(data => { 
        for (var i = 0; i < data.result.length; i++){
          var p: Pom = data.result[i];
          if ('CREATED' === p.status || 'OPEN' === p.status) {
            this.pom = p;
            this.pom.fy = p.fy;
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
