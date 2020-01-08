import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,of } from 'rxjs';
import { ProgrammingService } from './programming-service';
import { PomToasResponse } from '../models/POMToas';

@Injectable({
  providedIn: 'root'
})
export class ProgrammingServicesImpl extends ProgrammingService{

  constructor(protected httpClient:HttpClient){
    super(httpClient);
  }

  pBYearExists(year:string):Observable<Object>{
   
    return this.get("pom/sample/fromPB/year/" + year + "/exists");
  }

  getPomFromPb():Observable<Object>{
    return this.get("pom/init/fromPB"); 
  }
 
}