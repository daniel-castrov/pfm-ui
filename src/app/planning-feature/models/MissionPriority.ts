import { Attachment } from '../../pfm-common-models/Attachment';
import { Action } from '../../pfm-common-models/Action';

export class MissionPriority {
  public created:Date;
  public modified:Date;
  public modifiedBy:string;
  public createdBy:string;
  public id:string;
  public planningPhaseId:string;
  public order:number;
  public title:string;
  public description:string;

  //client side only
  public attachments:Attachment[];
  public attachmentsDisabled:boolean;
  public actions:Action;
}
