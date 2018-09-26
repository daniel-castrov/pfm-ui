import { Community } from '../../../generated/model/community';
import { Organization } from "../../../generated/model/organization";

export class CommunityWithOrgs {
  community: Community;
  myOrganization: Organization;
  organizations: Organization[] = [];

  // constructor() {}
  
  constructor( com:Community, orgs:Organization[], org:Organization ) {
    this.community=com;
    this.organizations=orgs;
    this.myOrganization=org;
  }
  
}