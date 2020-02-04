import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseRestService } from '../../services/base-rest.service';
import { Observable } from 'rxjs';

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
    return this.get('mydetails');
  }

  public getUserRoles(): Observable<object> {
    return this.get('getroles');
  }
}
