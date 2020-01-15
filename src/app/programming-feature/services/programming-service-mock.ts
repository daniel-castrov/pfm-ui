import { ProgrammingService } from './programming-service';
import { Observable, of, onErrorResumeNext } from 'rxjs';
import { ProgramRequestForPOM } from '../models/ProgramRequestForPOM';

export class ProgrammingServiceMock extends ProgrammingService{

  constructor(){
    super(null);
  }

  getRequestsForPom(pom):Observable<Object>{
    let data:ProgramRequestForPOM[] = [];
      for(let x=0; x<20; x++){
        let pr: ProgramRequestForPOM = new ProgramRequestForPOM();
        let program: string = "ABCDEFGHIJKLMNOPQURSTVWXWZ";
        pr.programName = program[Math.floor(Math.random() * program.length) + 1];
        pr.programName += program[Math.floor(Math.random() * program.length) + 1];
        pr.programName += program[Math.floor(Math.random() * program.length) + 1];
        pr.status = "OUTSTANDING";
        pr.assignedTo = "Funds Requestor";
        pr.fydp_total = 0;
        for(let i=16; i<24; i++) {
          pr["fy_" + i] = i==23 ? 0 : Math.floor(Math.random() * 5000) + 1;
          pr.fydp_total += pr["fy_" + i];
        }
        data.push(pr);
    }

    return of({result: data});
  }
}
