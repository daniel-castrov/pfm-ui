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

  constructor(private myDetailsService: MyDetailsService,
              private pomService: POMService,
              private pbService: PBService,
              private prService: PRService
  ) {}

  async ngOnInit() {
    const user: User = (await this.myDetailsService.getCurrentUser().toPromise()).result;
    this.initPomPrs(user);
    this.initPbPrs(user);
  }

  async initPomPrs(user: User) {
    this.pom = (await this.pomService.getByCommunityIdAndYear(user.currentCommunityId, this.by).toPromise()).result;
    this.pomProgrammaticRequests = (await this.prService.getByPhase(this.pom.id).toPromise()).result;
  }

  async initPbPrs(user: User) {
    this.pb = (await this.pbService.getByCommunityAndYear(user.currentCommunityId, this.by-2).toPromise()).result;
    this.pbProgrammaticRequests = (await this.prService.getByPhase(this.pb.id).toPromise()).result;
  }

}
