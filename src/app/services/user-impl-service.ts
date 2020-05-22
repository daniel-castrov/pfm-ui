import { BaseRestService } from './base-rest.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class UserService extends BaseRestService {
  abstract getFullNameFromCacIdList(cacIds: string[]): Observable<any>;
}
