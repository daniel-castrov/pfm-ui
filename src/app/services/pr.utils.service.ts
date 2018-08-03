import { ProgramType } from './../generated/model/programType';
import { ProgrammaticRequest } from './../generated/model/programmaticRequest';

export class PRUtils {

  static findGenericSubprogramChildren(prId: string, prs: ProgrammaticRequest[]): ProgrammaticRequest[] {
    return prs.filter( pr => pr.type === ProgramType.GENERIC && pr.creationTimeReferenceId == prId );
  }

}
