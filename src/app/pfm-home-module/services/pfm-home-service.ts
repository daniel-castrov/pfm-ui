import { Inject, Injectable } from '@angular/core';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

Injectable()
export class PfmHomeService{

  constructor(@Inject(HttpClient)private httpClient:HttpClient){

  }

  public getUserTasks():Observable<Object>{
    return null;//this.get("getUserTasks");//return all of the tasks - assigned/overdue/pending, let the component handle the logic to seperate it into a view
  }

  public getLatestNews():Observable<Object>{//return a list of news items
    return null;//this.get("getLatestNews");
  }

}