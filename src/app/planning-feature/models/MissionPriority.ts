import { MissionAttachment } from './MissionAttachment';
import { MissionAction } from './MissionAction';

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
  public attachments:MissionAttachment[];
  public attachmentsDisabled:boolean;
  public actions:MissionAction;
}
