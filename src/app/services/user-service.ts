import { UserService } from './user-impl-service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserServiceImpl extends UserService {
  getFullNameFromCacIdList(cacIds: string[]): Observable<any> {
    return this.get('users/cacids', new HttpParams().set('cacIds', cacIds.join(',')));
  }
}
