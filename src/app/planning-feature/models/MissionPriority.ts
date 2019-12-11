import { MissionAttachment } from './MissionAttachment';
import { MissionAction } from './MissionAction';

export class MissionPriority {
  public id:string;
  public planningPhaseId:string;
  public order:number;
  public title:string;
  public description:string;

  //client side only
  public attachments:MissionAttachment[];
  public actions:MissionAction;
}