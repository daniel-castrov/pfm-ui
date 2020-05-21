import { Variant } from './Variant';
import { IntIntMap } from './IntIntMap';
import { FundingLineHistory } from './funding-line-history.model';

export class FundingLine {
  created?: any;
  createdBy?: string;
  modified?: any;
  modifiedBy?: string;

  emphases?: Array<string>;

  id?: string;
  programId?: string;
  appropriation?: string;
  baOrBlin?: string;
  sag?: string;
  wucd?: string;
  expenditureType?: string;
  opAgency?: string;
  item?: string;
  programElement?: string;
  acquisitionType?: string;
  userCreated?: boolean;
  funds?: IntIntMap;
  ctc?: number;
  variants?: Array<Variant>;
  fundingLineHistories?: Array<FundingLineHistory>;

  constructor() {}
}
