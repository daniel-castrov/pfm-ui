import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NewsItem } from '../../pfm-home-module/models/NewsItem';
import { WidgetPreference } from '../models/WidgetPreference';
import { UserTask } from '../../pfm-home-module/models/UserTask';

//TODO - create an abstract/interface for this service, then we can easily switch out the real service for the mocke sercvice from our unit tests
@Injectable({
  providedIn: 'root'
})
export class DashboardMockService{

  constructor(){
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