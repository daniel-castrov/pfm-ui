import { ProgrammingService } from './programming-service';
import { Observable, of, onErrorResumeNext } from 'rxjs';
import { ProgramRequestForPOM } from '../models/ProgramRequestForPOM';
import { HttpClient } from '@angular/common/http';
import { ProgrammingAttachment } from '../models/ProgrammingAttachment';
import { TOA } from '../models/TOA';
import {Pom} from '../models/Pom';
import {PomToasResponse} from '../models/PomToasResponse';
import { Organization } from '../../pfm-common-models/Organization';


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
    let pomtoas:PomToasResponse = new PomToasResponse();
    let pomObj:Pom = new Pom();
    let toaObj:TOA = new TOA();
    let year:number = 2020;
    let amt:number = 10000;
    for(let x=0; x<5; x++){
      toaObj.year= year+x;
      toaObj.amount=amt+x;
      pomObj.communityToas.fill(toaObj);
    }
    return of(pomtoas); 
  }

  getAllorganizations():Observable<Object>{
    let data:Organization[] = [];
    let org:Organization = new Organization();
    org.id="5e1651b9ea2ae305c2af4473";
    org.communityId="5e1651b9ea2ae305c2af4332";
    org.abbreviation="JPEO-CBRND";
    org.name="Joint Program Executive Office for Chemical, Biological, Radiological, and Nuclear Defense";
    data.push(org);
    return of(data);
  }
}
