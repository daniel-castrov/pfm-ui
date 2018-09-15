import {FundingLine} from "../generated";

export class FundingLinesUtils {
    public static totalForAndAfterYear(fundingLines: FundingLine[], startingFiscalYear: number): number {
      return fundingLines
        .reduce( (acc, fl) => acc.concat(Object.entries(fl.funds)), [] )
        .filter( ([key]) => +key >= startingFiscalYear )
        .map(([key,value]) => value )
        .reduce( (a,b) => a+(b||0), 0 );
    }
}
