import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserTask } from '../models/UserTask';
import { NewsItem } from '../models/NewsItem';

Injectable({
  providedIn: 'root'
})
export class PfmHomeMockService{

  constructor(){
  }

  public getUserTasks():Observable<Object>{

    let t1:UserTask = new UserTask();
    t1.assignedDate = new Date();
    t1.dueDate = new Date();
    t1.description = "test description from mock service";
    t1.id = "1";
    t1.name = "test name from mock service";

    let t2:UserTask = new UserTask();
    t2.assignedDate = new Date();
    t2.dueDate = new Date();
    t2.description = "test description from mock service";
    t2.id = "2";
    t2.name = "test name from mock service";

    return of([t1, t2]);
  }

  public getLatestNews():Observable<Object>{//return a list of news items
    let n1:NewsItem = new NewsItem();
    n1.createDate = new Date();
    n1.details = "details from mock service";
    n1.priority = 1;
    n1.title = "mock news item 1";

    return of([n1]);
  }
}