import { PlanningService } from './planning-service';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MissionPriority } from '../models/MissionPriority';
import { MissionAction } from '../models/MissionAction';
import { MissionAttachment } from '../models/MissionAttachment';

export class PlanningServiceMock extends PlanningService{

  constructor(){
    super(null);
  }

  getAvailableCreatePlanningYears():Observable<Object>{
    return of([2021, 2022, 2023]);
  }

  getAvailableOpenPlanningYears():Observable<Object>{
    return of([2021, 2023]);
  }

  getMissionPrioritiesYears():Observable<Object>{
    return of([2021, 2022, 2023]);
  }

  getMissionPriorities(year:string):Observable<Object>{
    let list:MissionPriority[] = [];

    for(let i=0; i<100; i++){
      let data:MissionPriority = new MissionPriority();
      data.priority = i+1;
      data.title = "Enable Nuclear Deterrent";
      data.description = "Enable a safe, secure, reliable & effective Nuclear Deterrent";
      data.actions = new MissionAction();
      data.actions.canDelete = true;
      data.actions.canEdit = true;
      data.actions.canUpload = true;
      data.actions.canSave = true;

      data.attachments = [];
      let ma:MissionAttachment = new MissionAttachment();
      ma.name = "abc.doc";
      ma.type = "doc";
      ma.url = "http://google.com";
      data.attachments.push(ma);
      list.push(data);
    }

    return of(list);
  }

}