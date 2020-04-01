import { Attachment } from '../../pfm-common-models/Attachment';
import { Action } from '../../pfm-common-models/Action';

export class MissionPriority {
  created: Date;
  modified: Date;
  modifiedBy: string;
  createdBy: string;
  id: string;
  planningPhaseId: string;
  order: number;
  title: string;
  description: string;
  attachments: Attachment[];
  selected: boolean;

  // client side only
  attachmentsDisabled: boolean;
  actions: Action;
}
