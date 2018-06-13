import { User } from './../generated/model/user';
import { Observable } from 'rxjs/Observable';
import { RestResult } from './../generated/model/restResult';
import { MyDetailsService } from './../generated/api/myDetails.service';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'

@Injectable()
export class GlobalsService {

  constructor(private myDetailsService: MyDetailsService) {}

  // TODO: make it cache
  user(): Observable<User> {
    return this.myDetailsService.getCurrentUser().map( (response: RestResult) => response.result );
  }

}
