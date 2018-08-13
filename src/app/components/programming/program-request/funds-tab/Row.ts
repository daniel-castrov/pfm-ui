import { FundingLine } from '../../../../generated/model/fundingLine';

export class Row {

  public deltaFunds: Map<number, number> = new Map();

  constructor( public appropriation: string,
               public baOrBlin: string,
               public item: string,
               public opAgency: string,
               public pbFunds: Map<number, number>,
               public fundingLine: FundingLine ) {}

  calculateTotalForYear(year: number) {
    this.deltaFunds.set(year, (this.fundingLine.funds[year] || 0) - (this.pbFunds.get(year) || 0));
  }
}