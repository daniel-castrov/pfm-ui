import {PRService} from './../generated/api/pR.service';
import {Program} from './../generated/model/program';
import {ProgramsService} from './../generated/api/programs.service';
import {Injectable} from '@angular/core';
import {ProgramType} from "../generated";


@Injectable()
export class ProgramAndPrService {

  constructor( private programsService: ProgramsService,
               private prService: PRService ) {}

  async programs(): Promise<Program[]> {
    const programs: Program[] = (await this.programsService.getAll().toPromise()).result;
    return this.sort(programs);
  }

  async program(id: string): Promise<Program> {
    const programs: Program[] = await this.programs();
    return programs.find( program => program.id == id);
  }

  async programsByCommunity(communityId:string): Promise<Program[]> {
    const programs: Program[] = (await this.programsService.getProgramsByCommunity(communityId).toPromise()).result;
    return this.sort(programs);
  }

  async programRequests(phaseId: string): Promise<Program[]> {
    const prs: Program[] = (await this.prService.getByPhase(phaseId).toPromise()).result;
    return this.sort(prs);
  }

  async programRequest(phaseId: string, prId: string): Promise<Program> {
    const prs: Program[] = await this.programRequests(phaseId);
    return prs.find( pr => pr.id == prId);
  }

  async allProgramRequests(): Promise<Program[]> {
    const prs: Program[] = (await this.prService.getPrsForAllPoms().toPromise()).result;
    return this.sort(prs);
  }

  // in the case where there is a Program and a PR with same name, only the Program is returned
  async programsPlusPrs(phaseId: string): Promise<Program[]> {
    const prs: Program[] = await this.programRequests(phaseId);

    const programs: Program[] = (await this.programs());
    const mapIdToProgram: Map<string, Program> = this.createMapIdToProgram(programs);

    const prsWithoutPrograms: Program[] = prs.filter( pr => !mapIdToProgram.get(pr.id) );

    return this.sort(programs.concat(prsWithoutPrograms));
  }

  async programsPlusPrsMinusSubprograms(phaseId: string): Promise<Program[]> {
    const progOrPrs = await this.programsPlusPrs(phaseId);
    return progOrPrs.filter( progOrPr => progOrPr.type == ProgramType.PROGRAM );
  }

  async prsMinusGenericSubprograms(phaseId: string): Promise<Program[]> {
    const prs = await this.programRequests(phaseId);
    return prs.filter( progOrPr => progOrPr.type != ProgramType.GENERIC );
  }

  async programsMunisPrs(allPrograms: Program[], pomId: string): Promise<Program[]> {
    const prs: Program[] = await this.programRequests(pomId);

    const prNames: Set<string> = new Set();
    prs.forEach( pr => prNames.add(pr.shortName));

    return allPrograms.filter( program => !prNames.has(program.shortName) );
  }

  isProgram(programOrPr:Program): boolean {
    // This a bit flaky.
    // Alternatively, we could make a determination based on:
    // - the fiscal year
    // - the phase ID
    // - we could introduce a wrapper that remembers if the request is an MRDB program or a PR
    return ( programOrPr.programStatus == "COMPLETED" );
  }

  private sort(programs: Program[]): Program[] {
    return programs.sort((a: Program, b: Program) => {
      if (a.shortName === b.shortName) return 0;
      return (a.shortName < b.shortName ? -1 : 1);
    });
  }

  private createMapIdToProgram(programs: Program[]): Map<string, Program> {
    const mapIdToProgramOrPr: Map<string, Program> = new Map();
    programs.forEach( program => mapIdToProgramOrPr.set(program.id, program) );
    return mapIdToProgramOrPr;
  }

}
