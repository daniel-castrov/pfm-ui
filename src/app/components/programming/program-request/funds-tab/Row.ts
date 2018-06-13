export interface Row {
  appropriation: string,
  blin: string,
  pbFunds?: Map<number, number>,
  prFunds?: Map<number, number>,
  totalFunds?: Map<number, number>
}