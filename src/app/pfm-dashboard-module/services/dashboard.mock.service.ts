import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// TODO - create an abstract/interface for this service,
// then we can easily switch out the real service for the mocke sercvice from our unit tests
@Injectable({
  providedIn: 'root'
})
export class DashboardMockService {
  constructor() {}

  getAvailableWidgets(): Observable<object> {
    // return a list of widget that the user as selected to be displayed, and their position
    const availableWidgetList = [
      { id: 'w1', title: 'Mission Funding Money', selected: false },
      { id: 'w2', title: 'Mission Funding Priority', selected: false },
      { id: 'w3', title: 'POM Phase Funding', selected: false },
      { id: 'w4', title: 'PR Status', selected: false }
    ];
    return of(availableWidgetList);
  }

  getWidgetPreferences(key: string): Observable<object> {
    // return a list of widget that the user as selected to be displayed, and their position
    const json: string = localStorage.getItem(key);
    if (json && json !== 'undefined') {
      const prefs: any = JSON.parse(json);
      return of(prefs);
    }
    return of([]);
  }

  saveWidgetPreferences(key, wp: any): Observable<object> {
    // save the widgets and their layout

    const json: string = JSON.stringify(wp);
    localStorage.setItem(key, json);

    return of(wp);
  }
}
