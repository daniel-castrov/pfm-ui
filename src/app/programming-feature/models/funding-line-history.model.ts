import { Variant } from './Variant';
import { IntIntMap } from './IntIntMap';

export class FundingLineHistory {
  created?: any;
  createdBy?: string;
  modified?: any;
  modifiedBy?: string;

  emphases?: Array<string>;

  id?: string;
  fundingLineId?: string;
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
  reason: string;

  constructor() {}
}
