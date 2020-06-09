import { UFRStatus } from './enumerations/ufr-status.model';
import { ShortyType } from './enumerations/shorty-type.model';
import { Disposition } from './enumerations/disposition.model';
import { Program } from './Program';

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
}
