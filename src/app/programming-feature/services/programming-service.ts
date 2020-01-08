import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { PomToasResponse } from '../models/POMToas';

export abstract class ProgrammingService extends BaseRestService{

  constructor(protected httpClient:HttpClient){
    super(httpClient);
  }

   abstract  getRequestsForPom():Observable<Object>;
   abstract pBYearExists(year:string):Observable<Object>;
   abstract getPomFromPb():Observable<Object>;
}