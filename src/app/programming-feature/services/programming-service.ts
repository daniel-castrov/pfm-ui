import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import {Pom} from '../models/Pom';


export abstract class ProgrammingService extends BaseRestService {

  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

   abstract getRequestsForPom(pom: Pom): Observable<Object>;
}
