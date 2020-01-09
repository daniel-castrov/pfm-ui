import { ProgrammingService } from './programming-service';
import { Observable, of } from 'rxjs';
import { ProgramRequestForPOM } from '../models/ProgramRequestForPOM';
import { HttpClient } from '@angular/common/http';
import { ProgrammingAttachment } from '../models/ProgrammingAttachment';
import { TOA } from '../models/TOA';
import {Pom} from '../models/Pom';
import {PomToasResponse} from '../models/PomToasResponse';


export class ProgrammingServiceMock extends ProgrammingService{

  constructor(){
    super(null);
  }

  getRequestsForPom():Observable<Object>{
    let data:ProgramRequestForPOM[] = [];
      for(let x=0; x<20; x++){
        let pr: ProgramRequestForPOM = new ProgramRequestForPOM();
        let program: string = "ABCDEFGHIJKLMNOPQURSTVWXWZ";
        pr.programName = program[Math.floor(Math.random() * program.length) + 1];
        pr.programName += program[Math.floor(Math.random() * program.length) + 1];
        pr.programName += program[Math.floor(Math.random() * program.length) + 1];
        pr.status = "OUTSTANDING";
        pr.fydp_total = 0;
        for(let i=16; i<24; i++) {
          pr["fy_" + i] = Math.floor(Math.random() * 5000) + 1;
          pr.fydp_total += pr["fy_" + i];
        }
        data.push(pr);
    }

    return of(data);
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
