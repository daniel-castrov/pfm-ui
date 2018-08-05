import { ProgramType } from './../generated/model/programType';
import { ProgrammaticRequest } from './../generated/model/programmaticRequest';

export class PRUtils {

  static findGenericSubprogramChildren(prId: string, prs: ProgrammaticRequest[]): ProgrammaticRequest[] {
    return prs.filter( pr => pr.type === ProgramType.GENERIC && pr.creationTimeReferenceId == prId );
  }

  static calculateBaSumForPr(ba: string, year: number, pr: ProgrammaticRequest): number {
    return pr.fundingLines.filter(fl => fl.baOrBlin == ba)
                          .map( fl => fl.funds[year] ? fl.funds[year] : 0 )
                          .reduce((a,b)=>a+b, 0);
  }

  static isParentBaSumGreaterThanChildren(ba: string, year: number, pr: ProgrammaticRequest, prs: ProgrammaticRequest[]): boolean {
    const parentSum: number = PRUtils.calculateBaSumForPr(ba, year, pr);
    const childrenSum: number = PRUtils.findGenericSubprogramChildren(pr.id, prs)
                                       .map(pr => PRUtils.calculateBaSumForPr(ba, year, pr))
                                       .reduce((a,b) => a+b, 0);
    return parentSum >= childrenSum;
  }

}
