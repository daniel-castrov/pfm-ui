import { MissionAttachment } from './MissionAttachment';
import { MissionAction } from './MissionAction';

export class MissionPriority {
  public priority:number;
  public title:string;
  public description:string;
  public attachments:MissionAttachment[];
  public actions:MissionAction;
}