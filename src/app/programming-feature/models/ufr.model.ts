import { UFRStatus } from './enumerations/ufr-status.model';
import { ShortyType } from './enumerations/shorty-type.model';
import { Disposition } from './enumerations/disposition.model';
import { Program } from './Program';
import { FundingLine } from './funding-line.model';

export class UFR extends Program {
  id: string;
  requestNumber?: string;
  ufrName?: string;
  notes?: string;
  disposition?: Disposition;
  dispositionExplanation?: string;
  ufrStatus?: UFRStatus;
  shortyType?: ShortyType;
  originatedFrom?: UFR;
  milestoneImpact?: string;
  yoE?: boolean;
  proposedFundingLines?: Array<FundingLine>;
  totalRevisedFundingLines?: Array<FundingLine>;
  approvedFundingLines?: Array<FundingLine>;

  shortyTypeDescription?: string;
  ufrStatusDescription?: string;
  dispositionDescription?: string;
  action?: any;
}
