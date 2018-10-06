import { Organization } from '../../../generated/model/organization';
import { Community } from '../../../generated/model/community';
import { Role } from '../../../generated/model/role';

export class CommunityWithRolesAndOrgs {

  community: Community;       // The Community of interest
  userRoles: Role[] = [];     // The tagerUser's roles in this Community
  orgs: Organization[] = [];  // All the Organizations in thls Community
  org: Organization;          // The targetUer's Organization in this Community

  constructor(c: Community, urs: Role[], ogs: Organization[], og: Organization) {
    this.community = c;
    this.userRoles = urs.filter(role => role.name != "User" && role.name != "Organization_Member");
    this.orgs = ogs;
    this.org = og;
  }
}