import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NewsItem } from '../models/NewsItem';
import { WidgetPreference } from '../models/WidgetPreference';
import { UserTask } from '../models/UserTask';

//TODO - create an abstract/interface for this service, then we can easily switch out the real service for the mocke sercvice from our unit tests
@Injectable({
  providedIn: 'root'
})
export class DashboardMockService{

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

  public getWidgetPreferences():Observable<Object>{//return a list of widget that the user as selected to be displayed, and their position
    let wp1:WidgetPreference = new WidgetPreference();
    wp1.widgetColumnId = 1;
    wp1.widgetId = "w1";
    wp1.widgetIndex = 1;
    wp1.widgetRowId = 1;
    return of([wp1]);
  }

  public saveWidgetPreferences(wp:WidgetPreference[]):Observable<Object>{//save the widgets and their layout
    return of(wp);
  }

}