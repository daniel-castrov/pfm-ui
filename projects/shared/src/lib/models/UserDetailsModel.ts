import { UserRole } from './UserRole';
import { Communication } from './Communication';
import { CommunityModel } from './CommunityModel';

export class UserDetailsModel {
  public admin:boolean;
  public cn:string;
  public communication:Communication;
  public created:Date;
  public createdBy:string;
  public currentCommunityId:string;
  public firstName:string;
  public id:string;
  public lastName:string;
  public middleInitial:string;
  public modified:Date;
  public modifiedBy:string;
  public organizationId:string;
  public suspended:boolean;
  public valid:boolean;
  public userRole:UserRole;
  public currentCommunity:CommunityModel;
  public fullName:string;
}