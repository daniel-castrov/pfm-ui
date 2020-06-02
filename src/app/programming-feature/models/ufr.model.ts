import { UFRStatus } from './enumerations/ufr-status.model';
import { ShortyType } from './enumerations/shorty-type.model';
import { Disposition } from './enumerations/disposition.model';

export class UFR {
  id: string;
  requestNumber: number;
  ufrName: string;
  notes: string;
  disposition: Disposition;
  dispositionExplanation: string;
  ufrStatus: UFRStatus;
  shortyType: ShortyType;
  created?: any;
  modified?: any;
  modifiedBy?: string;
  createdBy?: string;
  modifiedByName?: string;
  createdByName?: string;
}
