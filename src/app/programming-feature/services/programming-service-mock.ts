import {ProgrammingService} from './programming-service';
import {Observable, of, onErrorResumeNext} from 'rxjs';
import {ProgramSummary} from '../models/ProgramSummary';

export class ProgrammingServiceMock{

    constructor() {
//        super(null);
    }

    getRequestsForPom(pom): Observable<Object> {
        let data: ProgramSummary[] = [];
        for (let x = 0; x < 20; x++) {
            let pr: ProgramSummary = new ProgramSummary();
            let program: string = 'ABCDEFGHIJKLMNOPQURSTVWXWZ';
            pr.programName = program[Math.floor(Math.random() * program.length) + 1];
            pr.programName += program[Math.floor(Math.random() * program.length) + 1];
            pr.programName += program[Math.floor(Math.random() * program.length) + 1];
            pr.status = 'OUTSTANDING';
            pr.assignedTo = 'Funds Requestor';
            pr.funds = {};
            pr.fundsTotal = 0;
            for (let i = 2016; i < 2024; i++) {
                pr.funds[i.toString()] = i === 2023 ? 0 : Math.floor(Math.random() * 5000) + 1;
                pr.fundsTotal += pr.funds[i.toString()];
            }
            data.push(pr);
        }

        return of({result: data});
    }
}
