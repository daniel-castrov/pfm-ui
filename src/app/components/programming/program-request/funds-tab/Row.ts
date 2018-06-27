export interface Row {
  appropriation: string,
  baOrBlin: string,
  item: string,
  opAgency: string,
  pbFunds: Map<number, number>,
  prFunds: Map<number, number>,
  totalFunds: Map<number, number>
}