import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {RoleService} from './role-service';
import {UserRole} from '../pfm-common-models/UserRole';

@Injectable({
  providedIn: 'root'
})
export class RoleServiceImpl extends RoleService {

  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getAll(): Observable<object> {
    return this.get('role');
  }

  getMap(): Observable<object> {
    const roles = new Map<string, UserRole>();
    return this.getAll().pipe(
      map((data: any) => {
        for (const role of data.result) {
          roles.set(role.id, role);
        }
        return roles;
      }),
      catchError(err => {
        console.log('error while getting role map');
        console.warn(err);
        return of(roles);
      })
    );
  }
}
