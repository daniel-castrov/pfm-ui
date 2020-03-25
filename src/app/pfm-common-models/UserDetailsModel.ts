import { UserRole } from './UserRole';
import { Communication } from './Communication';
import { CommunityModel } from './CommunityModel';
import { Moment } from 'moment';

export class UserDetailsModel {
  admin: boolean;
  cn: string;
  communication: Communication;
  created: Date;
  createdBy: string;
  currentCommunityId: string;
  firstName: string;
  id: string;
  lastName: string;
  middleInitial: string;
  modified: Date;
  modifiedBy: string;
  organizationId: string;
  suspended: boolean;
  valid: boolean;
  userRole: UserRole;
  roles: string[];
  currentCommunity: CommunityModel;
  fullName: string;
  lastLoginDate: Moment;
}
