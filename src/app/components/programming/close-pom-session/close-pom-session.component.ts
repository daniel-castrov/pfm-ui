import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {UserUtils} from '../../../services/user.utils';
import {ProgramAndPrService} from '../../../services/program-and-pr.service';
import {PBService, Pom, POMService, Program, PRService, User} from '../../../generated';
import {Notify} from '../../../utils/Notify';
import {CurrentPhase} from "../../../services/current-phase.service";
import {AppHeaderComponent} from "../../header/app-header/app-header.component";

@Component({
  selector: 'close-pom-session',
  templateUrl: './close-pom-session.component.html'
})

export class ClosePomSessionComponent implements OnInit {

  @ViewChild(AppHeaderComponent) header: AppHeaderComponent;

  pom:Pom;
  by;
  pomPrograms:Program[];
  pbPrograms:Program[];


  private currentCommunityId:string;
  private allPrsSubmitted:boolean;

  constructor(
    private pomService: POMService,
    private currentPhase: CurrentPhase,
    private prService: PRService,
    private pbService: PBService,
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
    this.pbPrograms = (await this.pbService.getFinalLatest().toPromise()).result;
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
