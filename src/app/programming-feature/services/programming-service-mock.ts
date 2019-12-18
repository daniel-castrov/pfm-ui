import { ProgrammingService } from './programming-service';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ProgrammingAttachment } from '../models/ProgrammingAttachment';

export class ProgrammingServiceMock extends ProgrammingService{

  constructor(){
    super(null);
  }

  pBYearExists(): Observable<Object>{
    let pbYear = (new Date()).getFullYear()-1;
     return of([pbYear]);
   }

}
