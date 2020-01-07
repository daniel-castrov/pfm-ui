import { ProgrammingService } from './programming-service';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ProgrammingAttachment } from '../models/ProgrammingAttachment';
import { PomToasResponse } from '../models/POMToas';

export class ProgrammingServiceMock extends ProgrammingService{
  constructor(){
    super(null);
  }

  pBYearExists(): Observable<Object>{
    let pbYear = (new Date()).getFullYear()-1;
     return of([pbYear]);
   }

   getPomFromPb(): Observable<Object> {
    //var object = new PomToasResponse();
    // return of(object);

    return this.get("pom/init/fromPB");
  }

}
