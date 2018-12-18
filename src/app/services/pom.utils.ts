import {User} from '../generated/model/user';
import {Observable} from 'rxjs/Observable';
import {RestResult} from '../generated/model/restResult';
import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map'
import {TemporaryCaching} from "./caching";
import {Pom, POMService} from "../generated";
import {UserUtils} from "./user.utils";
import {Subject} from "rxjs";

/**
 * Caching, performant service for the current POM.
 */
@Injectable()
export class PomUtils {

  constructor( private userUtils: UserUtils,
               private pomService: POMService ) {}


  @TemporaryCaching('currentPOM')
  currentPom(): Observable<Pom> {
    const subject = new Subject();
    (async () => {
      let poms: Pom[];
      const user: User = await this.userUtils.user().toPromise();
      poms = await this.pomService.getByCommunityId(user.currentCommunityId)
            .map( (response: RestResult) => response.result ).toPromise();
      poms = poms.sort( (a:Pom, b:Pom) => b.fy-a.fy );
      subject.next(poms[0]);
      subject.complete();
    })();
    return subject;
  }

}
