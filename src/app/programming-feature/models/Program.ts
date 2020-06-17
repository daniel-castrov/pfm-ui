import { FundingLine } from './funding-line.model';
import { Milestone } from './Milestone';
import { ProgramStatus } from './enumerations/program-status.model';
import { Attachment } from '../../pfm-common-models/Attachment';
import { Asset } from './asset.model';
import { Schedule } from './schedule.model';

export class Program {
  created: any;
  createdBy: string;
  modified: any;
  modifiedBy: string;

  emphases: Array<string>;

  id: string;
  parentId?: string;
  organizationId: string;
  programStatus: ProgramStatus;
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
  schedules: Array<Schedule>;
  assets: Array<Asset>;
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
  divisionId: string;
  missionPriorityId: string;
  agencyPriority: number;
  directoratePriority: number;
  secDefLOEId: string;
  strategicImperativeId: string;
  agencyObjectiveId: string;

  aim: string;
  goal: string;
  quality: string;
  other: string;

  attachments: Attachment[];
  userCreated: boolean;

  fullNameCreatedBy?: string;
  fullNameModifiedBy?: string;

  constructor() {}
}
