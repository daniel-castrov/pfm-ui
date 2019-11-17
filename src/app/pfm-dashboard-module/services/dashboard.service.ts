import { Injectable } from '@angular/core';
import { BaseRestService } from '../../../../projects/shared/src/lib/services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WidgetPreference } from '../models/WidgetPreference';


//TODO - use this services for dashboard and widgets
@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseRestService{
  constructor(protected httpClient:HttpClient){
    super(httpClient);
  }

  public getWidgetPreferences():Observable<Object>{//return a list of widget that the user as selected to be displayed, and their position
    return this.get("getWidgetPreferences");
  }

  public saveWidgetPreferences(wp:WidgetPreference[]):Observable<Object>{//save the widgets and their layout
    return this.post("saveWidgetPreferences", wp);
  }

  /*TODO - models/services for widgets
  public getMissionFundingMoney();
  public getMissionFundingPriority();
  public getPHOMPhaseFunding();
  public getPRStatus();
  */
}