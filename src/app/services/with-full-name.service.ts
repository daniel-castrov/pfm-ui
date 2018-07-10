import { Type } from './../components/programming/program-request/page-mode.service';
import { PRService } from './../generated/api/pR.service';
import { ProgrammaticRequest } from './../generated/model/programmaticRequest';
import { ProgramsService } from './../generated/api/programs.service';
import { Program } from './../generated/model/program';
import { Injectable } from '@angular/core';

export interface WithFullName {
  fullname: string;
}

export interface ProgramWithFullName extends Program, WithFullName {};
export interface ProgramRequestWithFullName extends ProgrammaticRequest, WithFullName {};

@Injectable()
export class WithFullNameService {

  constructor( private programsService: ProgramsService,
               private prService: PRService ) {}

  async programs(): Promise<ProgramWithFullName[]> {
    const programs: Program[] = (await this.programsService.getAll().toPromise()).result;
    const mapIdToProgram: Map<string, Program> = this.createMapIdToProgram(programs);
    
    const result: ProgramWithFullName[] = programs.map( (program: Program) => 
      ({ ...program, fullname: this.programFullName(program, mapIdToProgram) })
    );

    return this.sort(result);
  }

  async programRequests(phaseId: string): Promise<ProgramRequestWithFullName[]> {
    const programs: Program[] = (await this.programsService.getAll().toPromise()).result;
    const mapIdToProgram: Map<string, Program> = this.createMapIdToProgram(programs);

    const prs: ProgrammaticRequest[] = (await this.prService.getByPhase(phaseId).toPromise()).result;
    const mapIdToPr: Map<string, ProgrammaticRequest> = this.createMapIdToProgram(prs);
    
    const result: ProgramRequestWithFullName[] = prs.map( (pr: ProgrammaticRequest) => 
      ({ ...pr, fullname: this.prFullName(pr, mapIdToProgram, mapIdToPr) })
    );

    return this.sort(result);
  }

  private sort(withFullName: WithFullName[]): WithFullName[] {
    return withFullName.sort((a: WithFullName, b: WithFullName) => {
      if (a.fullname === b.fullname) return 0;
      return (a.fullname < b.fullname ? -1 : 1);
    });
  }

  private createMapIdToProgram<T>(programsOrPrs: T[]): Map<string, T> {
    const mapIdToProgramOrPr: Map<string, T> = new Map();
    programsOrPrs.forEach( (programOrPr: any) => mapIdToProgramOrPr.set(programOrPr.id, programOrPr) );
    return mapIdToProgramOrPr;
  }

  private prFullName(pr: ProgrammaticRequest, mapIdToProgram: Map<string, Program>, mapIdToPr: Map<string, ProgrammaticRequest>): string {
    var parentName = '';
    if (pr.creationTimeType === Type[Type.SUBPROGRAM_OF_PR_OR_UFR]) {
      parentName = this.prFullName(mapIdToPr.get(pr.creationTimeReferenceId), mapIdToProgram, mapIdToPr) + '/';
    } else if (pr.creationTimeType === Type[Type.SUBPROGRAM_OF_MRDB]) {
      parentName = this.programFullName(mapIdToProgram.get(pr.creationTimeReferenceId), mapIdToProgram) + '/';
    } else if (pr.creationTimeType === Type[Type.PROGRAM_OF_MRDB]) {
      const program: Program = mapIdToProgram.get(pr.creationTimeReferenceId);
      if(program.parentMrId) {
        parentName = this.programFullName(mapIdToProgram.get(program.parentMrId), mapIdToProgram) + '/';
      }
    } else if (pr.creationTimeType === Type[Type.PROGRAM_OF_MRDB]) {
      // do nothing
    } else {
      console.log('Error!!! Programmatic Request creation time type not set.');
    }
    return parentName + pr.shortName;
  }

  private programFullName(program: Program, mapIdToProgram: Map<string, Program>): string {
    let parentName = '';
    if (program.parentMrId) {
      parentName = this.programFullName(mapIdToProgram.get(program.parentMrId), mapIdToProgram) + '/';
    }
    return parentName + program.shortName;
  }
}
