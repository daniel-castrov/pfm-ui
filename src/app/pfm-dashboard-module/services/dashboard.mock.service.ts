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

  public getAvailableWidgets():Observable<Object> {//return a list of widget that the user as selected to be displayed, and their position
    let availableWidgetList = [{id: 'w1', title: 'Mission Funding Money', selected: false},{id: 'w2', title: 'Mission Funding Priority', selected: false}, {id: 'w3', title: 'POM Phase Funding', selected: false},{id: 'w4', title: 'PR Status', selected: false}];
    return of(availableWidgetList);
  }

  public getWidgetPreferences():Observable<Object>{//return a list of widget that the user as selected to be displayed, and their position
    let json:string = localStorage.getItem("dashboard-pref");
    if(json && json !== "undefined"){
      let prefs:WidgetPreference[] = JSON.parse(json);
      return of(prefs);
    }
    return of([]);
  }

  public saveWidgetPreferences(wp:any[]):Observable<Object>{//save the widgets and their layout

    let json:string = JSON.stringify(wp);
    localStorage.setItem("dashboard-pref", json);

    return of(wp);
  }

}