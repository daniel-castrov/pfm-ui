import { POMService, Pom, User } from './../generated';
import { UserUtils } from './user.utils';
import { Observable } from 'rxjs/Observable';
import { RestResult } from '../generated/model/restResult';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/filter'
import { from } from 'rxjs/observable/from';

@Injectable()
export class CycleUtils {

  constructor(private userUtils: UserUtils,
              private pomService: POMService) {}

  currentPom(): Observable<Pom> {
    return this.userUtils.user()
      .switchMap( (user: User) => this.pomService.getByCommunityId(user.currentCommunityId) )
      .map( (response: RestResult) => response.result )
      .switchMap( (poms: Pom[]) => from(poms) )
      .filter( (pom: Pom) => 'CREATED' === pom.status || 'OPEN' === pom.status);
  }

}
