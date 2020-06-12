import { FundingLineHistory } from './funding-line-history.model';

export class FundingData {
  id?: string;
  containerId?: string;
  appropriation: string;
  baOrBlin?: string;
  sag?: string;
  wucd?: string;
  expenditureType?: string;
  userCreated?: boolean;
  fundingLineHistories?: Array<FundingLineHistory>;

  py1: number;
  py: number;
  cy: number;
  by: number;
  by1: number;
  by2: number;
  by3: number;
  by4: number;
  fyTotal: number;
  ctc: number;

  action: any;
  isDisabled?: boolean;
}
