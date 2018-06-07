import { ProgramsService } from './../generated/api/programs.service';
import { Program } from './../generated/model/program';
import { Injectable } from '@angular/core';

export interface ProgramWithFullName extends Program {
  fullname: string;
}

@Injectable()
export class ProgramsWithFullNameService {

  constructor( private programsService: ProgramsService) { }

  async programs():Promise<ProgramWithFullName[]> {

    const data: Program[] = (await this.programsService.getAll().toPromise()).result;

    const mapIdToProgram: Map<string, Program> = new Map<string, Program>();
    const result: ProgramWithFullName[] = [];

    data.forEach((program: Program) => {
      mapIdToProgram.set(program.id, program);
    });

    data.forEach((program: Program) => {
      result.push({ ...program, fullname: this.fullName(program, mapIdToProgram) });
    });

    result.sort(function (a, b) {
      if (a.fullname === b.fullname) {
        return 0;
      }
      return (a.fullname < b.fullname ? -1 : 1);
    });

    return result;
  }

  private fullName(program: Program, mapIdToProgram: Map<string, Program>): string {
    var programName = '';
    if (null != program.parentId) {
      programName = this.fullName(mapIdToProgram.get(program.parentId), mapIdToProgram) + '/';
    }
    return programName + program.shortName;
  }
}
