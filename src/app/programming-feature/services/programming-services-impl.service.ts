import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProgrammingService } from './programming-service';

@Injectable({
  providedIn: 'root'
})
export class ProgrammingServicesImpl extends ProgrammingService{

  constructor(protected httpClient:HttpClient){
    super(httpClient);
  }

  getRequestsForPom():Observable<Object>{
    return this.getFullResponse("pom/sample/fromPB/year/");
  }

  pBYearExists(year:string):Observable<Object>{
   
    return this.getFullResponse("pom/sample/fromPB/year/" + year + "/exists");
  }

 
}