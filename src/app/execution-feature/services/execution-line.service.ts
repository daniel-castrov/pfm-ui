import { Injectable } from '@angular/core';
import { BaseRestService } from 'src/app/services/base-rest.service';
import { Observable } from 'rxjs';

@Injectable()
export abstract class ExecutionLineService extends BaseRestService {
  abstract getById(id: string): Observable<any>;
}
