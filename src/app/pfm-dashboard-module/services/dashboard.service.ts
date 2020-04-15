import { Injectable } from '@angular/core';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WidgetPreference } from '../models/WidgetPreference';

// TODO - use this services for dashboard and widgets
@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getAvailableWidgets(): Observable<object> {
    // return a list of widget that the user as selected to be displayed, and their position
    return this.get('getAvailableWidgets');
  }

  getWidgetPreferences(): Observable<object> {
    // return a list of widget that the user as selected to be displayed, and their position
    return this.get('getWidgetPreferences');
  }

  saveWidgetPreferences(wp: WidgetPreference[]): Observable<object> {
    // save the widgets and their layout
    return this.post('saveWidgetPreferences', wp);
  }

  /*TODO - models/services for widgets
  public getMissionFundingMoney();
  public getMissionFundingPriority();
  public getPHOMPhaseFunding();
  public getPRStatus();
  */
}
