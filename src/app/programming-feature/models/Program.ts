import { FundingLine } from './FundingLine';
import { Milestone } from './Milestone';

export class Program {
  created: any;
  createdBy: string;
  modified: any;
  modifiedBy: string;

  emphases: Array<string>;

  id: string;
  organizationId: string;
  programStatus: string;
  bulkOrigin: boolean;
  type: string;
  containerId: string;
  description: string;
  shortName: string;
  longName: string;
  imageName: string;
  imageArea: string;
  infolink: string;
  justification?: string;
  impactN: string;
  execution: string;
  fundingLines: Array<FundingLine>;
  milestones: Array<Milestone>;
  primaryCapability: string;
  coreCapability: string;
  secondaryCapability: string;
  functionalArea: string;
  medicalArea: string;
  nbcCategory: string;
  commodityArea: string;
  bsvStrategy: string;
  dasdCbd: string;
  leadComponent: string;
  manager: string;
  acquisitionType?: string;
  responsibleRoleId: string;
  secDefLOE: string;
  strategicImperative: string;
  agencyObjective: string;

  constructor() { }
}
