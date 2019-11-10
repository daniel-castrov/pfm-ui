import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseRestService } from '../../../../projects/shared/src/lib/services/base-rest.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SigninService extends BaseRestService{

  constructor(protected httpClient:HttpClient){
    super(httpClient);
  }

  public signIn():Observable<Object>{
    return this.getFullResponse("blank");
  }

  public getUserDetails():Observable<Object>{
    return this.get("mydetails");
  }

  public getUserRoles():Observable<Object>{
    return this.get("getroles");
  }

}
