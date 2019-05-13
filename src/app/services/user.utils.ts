import {CommunityService} from '../generated/api/community.service';
import {Community} from '../generated/model/community';
import {User} from '../generated/model/user';
import {Observable} from 'rxjs';
import {RestResult} from '../generated/model/restResult';
import {MyDetailsService} from '../generated/api/myDetails.service';
import {Injectable} from '@angular/core';
import {Caching, TemporaryCaching} from './caching';
import {RolesPermissionsService} from '../generated';
import {map, switchMap} from 'rxjs/operators';

/**
 * Caching, performant service for the current user, their roles and other permanent or near-permanent data.
 * Examples of near-permanent data is user community and organization because they change rarely.
 */
@Injectable({
  providedIn: 'root'
})
export class UserUtils {

  constructor(private myDetailsService: MyDetailsService,
              private communityService: CommunityService,
              private rolesPermissionsService: RolesPermissionsService) {}

  @Caching('user')
  user(): Observable<User> {
    return this.myDetailsService.getCurrentUser().pipe(map( (response: RestResult) => response.result ));
  }

  @TemporaryCaching('currentCommunity')
  currentCommunity(): Observable<Community> {
    return this.user()
      .pipe(switchMap( (user: User) => this.communityService.getById(user.currentCommunityId) ))
      .pipe(map( (response: RestResult) => response.result ));
  }

  @TemporaryCaching('roles')
  roles(): Observable<string[]> {
    return this.rolesPermissionsService.getRoles().pipe(map( (response: RestResult) => response.result ));
  }

  hasAnyOfTheseRoles(...clientRoles: String[]): Observable<boolean> {
    return this.roles()
      .pipe(map( (serverRoles: string[]) => serverRoles.some( serverRole => clientRoles.includes(serverRole)) ));
  }

}
