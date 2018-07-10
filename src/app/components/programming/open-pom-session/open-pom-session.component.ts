import { Component, OnInit } from '@angular/core';
import { GlobalsService } from '../../../services/globals.service';
import { User, Pom, POMService, PBService, PRService } from '../../../generated/';
import { forkJoin } from "rxjs/observable/forkJoin";

@Component({

  selector: 'app-open-pom-session',
  templateUrl: './open-pom-session.component.html',
  styleUrls: ['./open-pom-session.component.scss']
})
export class OpenPomSessionComponent implements OnInit {

  private allPrsSubmitted:boolean=true;
  private pomStatusIsOpen:boolean=true;
  private pom:Pom;
  private pomProgrammaticRequests;
  private pbProgrammaticRequests;
  private pb;
  private allSumitted:boolean = false;
  private by;

  constructor( 
    private pomService: POMService,
    private pbService: PBService,
    private globalsService: GlobalsService,
    private prService: PRService,
  ) { 
  }

  async ngOnInit() {
    const user:User = await this.globalsService.user().toPromise();
    await Promise.all([this.initPomPrs(user),this.initPbPrs(user)]);
    this.by=this.pom.fy;
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

  // openPom( event ) {
  //   if (this.allPrsSubmitted) {
  //     this.pomService.open(this.pomId).subscribe(data => {
  //       this.pomStatusIsOpen = true;
  //     });
  //   }
  // }

}
