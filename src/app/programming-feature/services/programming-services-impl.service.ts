import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,of } from 'rxjs';
import { ProgrammingService } from './programming-service';


@Injectable({
  providedIn: 'root'
})
export class ProgrammingServicesImpl extends ProgrammingService{

  constructor(protected httpClient:HttpClient){
    super(httpClient);
  }

  getRequestsForPom():Observable<Object>{
    return this.get("pom/sample/fromPB/year/");
  }

  pBYearExists(year:string):Observable<Object>{
    return this.get("pom/init/fromPB/year/" + year + "/exists");
  }

  getPomFromPb():Observable<Object>{
    return this.get("pom/init/fromPB"); 
  }
 
  getAllorganizations():Observable<Object>{
    return this.get("organization"); 
  }

  getPomFromFile(fileId:string):Observable<Object>{
    return this.get("pom/init/fromLibrary/id/" + fileId);
  }
  
}
