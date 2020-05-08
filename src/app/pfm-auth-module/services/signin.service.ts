import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseRestService } from '../../services/base-rest.service';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { map } from 'rxjs/operators';
import { RestResponse } from 'src/app/util/rest-response';

@Injectable({
  providedIn: 'root'
})
export class SigninService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  signIn(): Observable<object> {
    return this.get('blank');
  }

  getUserDetails(): Observable<object> {
    return this.get('mydetails').pipe(map((res: RestResponse<any>) => this.convertDateFromServer(res)));
  }

  getUserRoles(): Observable<object> {
    return this.get('getroles');
  }

  protected convertDateFromServer(res: RestResponse<any>): RestResponse<any> {
    if (res.result) {
      res.result.lastLoginDate = res.result.lastLoginDate != null ? moment(res.result.lastLoginDate) : null;
    }
    return res;
  }
}
