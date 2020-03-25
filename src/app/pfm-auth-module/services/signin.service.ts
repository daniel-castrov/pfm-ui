import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseRestService } from '../../services/base-rest.service';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SigninService extends BaseRestService {

  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  public signIn(): Observable<object> {
    return this.get('blank');
  }

  public getUserDetails(): Observable<object> {
    return this.get('mydetails')
      .pipe(map((res: RestResponse) => this.convertDateFromServer(res)));
  }

  public getUserRoles(): Observable<object> {
    return this.get('getroles');
  }

  protected convertDateFromServer(res: RestResponse): RestResponse {
    if (res.result) {
      res.result.lastLoginDate = res.result.lastLoginDate != null ?
        moment(res.result.lastLoginDate) : null;
    }
    return res;
  }

}
