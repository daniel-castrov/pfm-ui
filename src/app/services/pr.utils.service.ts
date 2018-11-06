import { ProgramType } from './../generated/model/programType';
import { ProgrammaticRequest } from './../generated/model/programmaticRequest';

export class PRUtils {

  static findGenericSubprogramChildren(parentId: string, prs: ProgrammaticRequest[]): ProgrammaticRequest[] {
    return prs.filter( pr => pr.type === ProgramType.GENERIC && pr.creationTimeReferenceId == parentId );
  }

  private static calculateBaSumForPr(ba: string, year: number, pr: ProgrammaticRequest): number {
    return pr.fundingLines.filter(fl => fl.baOrBlin == ba)
                          .map( fl => fl.funds[year] ? fl.funds[year] : 0 )
                          .reduce((a,b)=>a+b, 0);
  }

  static isParentBaSumGreater(  ba: string, 
                                year: number, 
                                parentPr: ProgrammaticRequest, 
                                inPr: ProgrammaticRequest,
                                inPrs: ProgrammaticRequest[] ): boolean {
    const parentSum: number = PRUtils.calculateBaSumForPr(ba, year, parentPr);

    // from the list of prs: remove the current pr (if saved/existing) and (re)apply it with one that exists separately from the list. Trey are different.
    let prs: ProgrammaticRequest[] = PRUtils.findGenericSubprogramChildren(parentPr.id, inPrs);
    prs = prs.filter(pr => pr.id !== inPr.id);
    prs.push(inPr);

    const childrenSum: number = prs.map(pr => PRUtils.calculateBaSumForPr(ba, year, pr))
                                   .reduce((a,b) => a+b, 0);
    return parentSum >= childrenSum;
  }

  static isChildrenBaSumSmaller(  ba: string, 
                                  year: number, 
                                  pr: ProgrammaticRequest, 
                                  prs: ProgrammaticRequest[] ): boolean {
    const parentSum: number = PRUtils.calculateBaSumForPr(ba, year, pr);
    const childrenSum: number = PRUtils.findGenericSubprogramChildren(pr.id, prs)
                                       .map(pr => PRUtils.calculateBaSumForPr(ba, year, pr))
                                       .reduce((a,b) => a+b, 0);
    return parentSum >= childrenSum;
  }

  static getOrganizationNameForLeadComponent(leadComponent:string) : string {

    let orgstring:string;
    if (leadComponent == "ECBC"){ 
      return "DUSA-TE";
    } else {
      return leadComponent;
    }
  }

  static getOpAgencyForLeadComponent(leadComponent:string) : string {
    let map = new Map<string,string>();
    
    map.set("JPEO-CBRND", "5Y");
    map.set("JRO-CBRND",  "JCO");
    map.set("JSTO-CBD",   "");
    map.set("PAIO",       "");
    map.set("ODASD(CBD)", "26");
    map.set("DUSA-TE",    "41");
    map.set("ECBC",       "6N");
     
    return  map.get(leadComponent) == null ? "" :  map.get(leadComponent);
  }
}
