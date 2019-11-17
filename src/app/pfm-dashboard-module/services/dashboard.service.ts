import { Injectable } from '@angular/core';
import { BaseRestService } from '../../../../projects/shared/src/lib/services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewsItem } from '../models/NewsItem';
import { WidgetPreference } from '../models/WidgetPreference';
import { UserTask } from '../models/UserTask';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseRestService{
  constructor(protected httpClient:HttpClient){
    super(httpClient);
  }

  public getUserTasks():Observable<Object>{
    return this.get("getUserTasks");//return all of the tasks - assigned/overdue/pending, let the component handle the logic to seperate it into a view
  }

  public getLatestNews():Observable<Object>{//return a list of news items
    return this.get("getLatestNews");
  }

  public getWidgetPreferences():Observable<Object>{//return a list of widget that the user as selected to be displayed, and their position
    return this.get("getWidgetPreferences");
  }

  public saveWidgetPreferences(wp:WidgetPreference[]):Observable<Object>{//save the widgets and their layout
    return this.post("saveWidgetPreferences", wp);
  }
}