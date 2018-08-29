import { CreationTimeType } from './../generated/model/creationTimeType';
import { ProgramRequestWithFullName, ProgramWithFullName} from './with-full-name.service';
import { PRService } from './../generated/api/pR.service';
import { ProgrammaticRequest } from './../generated/model/programmaticRequest';
import { ProgramsService } from './../generated/api/programs.service';
import { Program } from './../generated/model/program';
import { Injectable } from '@angular/core';
import {ProgramType} from "../generated";

export interface WithFullName {
  fullname: string;
}

export interface ProgramWithFullName extends Program, WithFullName {};
export interface ProgramRequestWithFullName extends ProgrammaticRequest, WithFullName {};
export type ProgramOrPrWithFullName = ProgramWithFullName | ProgramRequestWithFullName;

@Injectable()
export class WithFullNameService {

  constructor( private programsService: ProgramsService,
               private prService: PRService ) {}

  async programs(): Promise<ProgramWithFullName[]> {
    const programs: Program[] = (await this.programsService.getAll().toPromise()).result;
    const mapIdToProgram: Map<string, Program> = this.createMapIdToProgramOrPr(programs);

    const result: ProgramWithFullName[] = programs.map( (program: Program) =>
      ({ ...program, fullname: this.programFullName(program, mapIdToProgram) })
    );

    return this.sort(result);
  }

  async programsByCommunity(communityId:string): Promise<ProgramWithFullName[]> {
    const programs: Program[] = (await this.programsService.getProgramsByCommunity(communityId).toPromise()).result;
    const mapIdToProgram: Map<string, Program> = this.createMapIdToProgramOrPr(programs);

    const result: ProgramWithFullName[] = programs.map( (program: Program) =>
      ({ ...program, fullname: this.programFullName(program, mapIdToProgram) })
    );

    return this.sort(result);
  }

/**
 * The PRs can form a hierarchy in two different ways:
 *
 *  - using the creation time data (creationTimeReferenceId) where a PR w/o a program can have a parent be another PR and so on until a PR
 * in the chain has a parent in the MRDB Programs collection via its parentMrId field. From there on parenting is established via the Programs collection.
 * This is applicable to the POM PRs while they are being modified/worked on.
 * Example full name resulting from such a hierarchy: /ROOT_PROGRAM/SUBPROGRAM_1/pr_1/pr_2,  where upper case is a Program name and lower case is a PR name.
 *
 *  - using the archival data (parentMrId). In this case the PR does have a Program in MRDB. Example: /ROOT_PROGRAM/SUBPROGRAM_1, i.e. the Program of the PR.
 * This is applicable to PB PRs while the POM PRs are being worked on.
 *
 * NB: Capitatalization illustrates how the full name is constructed and not how it is represented to the user in the UI.
 */

  async programRequestsWithFullNamesDerivedFromCreationTimeData(phaseId: string): Promise<ProgramRequestWithFullName[]> {
    const programs: Program[] = (await this.programsService.getAll().toPromise()).result;
    const mapIdToProgram: Map<string, Program> = this.createMapIdToProgramOrPr(programs);

    const prs: ProgrammaticRequest[] = (await this.prService.getByPhase(phaseId).toPromise()).result;
    const mapIdToPr: Map<string, ProgrammaticRequest> = this.createMapIdToProgramOrPr(prs);

    const result: ProgramRequestWithFullName[] = prs.map( (pr: ProgrammaticRequest) =>
      ({ ...pr, fullname: this.prFullNameDerivedFromCreationTimeData(pr, mapIdToProgram, mapIdToPr) })
    );

    return this.sort(result);
  }

  async programRequestsWithFullNamesDerivedFromArchivalData(phaseId: string): Promise<ProgramRequestWithFullName[]> {
    const programs: Program[] = (await this.programsService.getAll().toPromise()).result;
    const mapIdToProgram: Map<string, Program> = this.createMapIdToProgramOrPr(programs);

    const prs: ProgrammaticRequest[] = (await this.prService.getByPhase(phaseId).toPromise()).result;

    const result: ProgramRequestWithFullName[] = prs.map( (pr: ProgrammaticRequest) =>
      ({ ...pr, fullname: this.prFullNameDerivedFromArchivalData(pr, mapIdToProgram) })
    );

    return this.sort(result);
  }

  async fullNameDerivedFromCreationTimeData(pr: ProgrammaticRequest): Promise<string> {
    const programs: Program[] = (await this.programsService.getAll().toPromise()).result;
    const mapIdToProgram: Map<string, Program> = this.createMapIdToProgramOrPr(programs);

    const prs: ProgrammaticRequest[] = (await this.prService.getByPhase(pr.phaseId).toPromise()).result;
    const mapIdToPr: Map<string, ProgrammaticRequest> = this.createMapIdToProgramOrPr(prs);

    return this.prFullNameDerivedFromCreationTimeData(pr, mapIdToProgram, mapIdToPr);
  }

  async programsPlusPrs(phaseId: string): Promise<WithFullName[]> {
    const prs: ProgramRequestWithFullName[] = await this.programRequestsWithFullNamesDerivedFromCreationTimeData(phaseId);
    const prsWithoutPrograms: ProgramRequestWithFullName[] = prs.filter( (pr: ProgramRequestWithFullName) =>
      pr.creationTimeType !== CreationTimeType.PROGRAM_OF_MRDB &&
      pr.type !== ProgramType.GENERIC);

    const programs: ProgramWithFullName[] = (await this.programs());
    return this.sort((<WithFullName[]>programs).concat(prsWithoutPrograms));
  }

  private sort(withFullName: WithFullName[]): WithFullName[] {
    return withFullName.sort((a: WithFullName, b: WithFullName) => {
      if (a.fullname === b.fullname) return 0;
      return (a.fullname < b.fullname ? -1 : 1);
    });
  }

  private createMapIdToProgramOrPr<T>(programsOrPrs: T[]): Map<string, T> {
    const mapIdToProgramOrPr: Map<string, T> = new Map();
    programsOrPrs.forEach( (programOrPr: any) => mapIdToProgramOrPr.set(programOrPr.id, programOrPr) );
    return mapIdToProgramOrPr;
  }

  private prFullNameDerivedFromCreationTimeData(pr: ProgrammaticRequest, mapIdToProgram: Map<string, Program>, mapIdToPr: Map<string, ProgrammaticRequest>): string {
    var parentName = '';
    switch(pr.creationTimeType) {
      case CreationTimeType.SUBPROGRAM_OF_PR_OR_UFR:
        parentName = this.prFullNameDerivedFromCreationTimeData(mapIdToPr.get(pr.creationTimeReferenceId), mapIdToProgram, mapIdToPr) + '/';
        break;
      case CreationTimeType.SUBPROGRAM_OF_MRDB:
        parentName = this.programFullName(mapIdToProgram.get(pr.creationTimeReferenceId), mapIdToProgram) + '/';
        break;
      case CreationTimeType.PROGRAM_OF_MRDB:
        const program: Program = mapIdToProgram.get(pr.creationTimeReferenceId);
        if(program.parentMrId) {
          parentName = this.programFullName(mapIdToProgram.get(program.parentMrId), mapIdToProgram) + '/';
        }
        break;
      case CreationTimeType.NEW_PROGRAM:
        // do nothing
        break;
      default:
        console.log('Error!!! Programmatic Request creation time type not set.');
    }
    return parentName + pr.shortName;
  }

  private prFullNameDerivedFromArchivalData(pr: ProgrammaticRequest, mapIdToProgram: Map<string, Program>): string {
    return this.programFullName(mapIdToProgram.get(pr.originalMrId), mapIdToProgram);
  }

  private programFullName(program: Program, mapIdToProgram: Map<string, Program>): string {

    let parentName = '';
    if (program.parentMrId) {
      parentName = this.programFullName(mapIdToProgram.get(program.parentMrId), mapIdToProgram) + '/';
    }
    return parentName + program.shortName;
  }

}
