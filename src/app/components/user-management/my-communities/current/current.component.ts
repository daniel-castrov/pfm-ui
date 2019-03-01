import {Component, Input} from '@angular/core';
import {Community, Organization, User} from '../../../../generated';
import {MyDetailsService} from '../../../../generated/api/myDetails.service';
import {OrganizationService} from '../../../../generated/api/organization.service';
import {AppHeaderComponent} from "../../../header/app-header/app-header.component";


class HeaderComponent {
}

@Component({
  selector: 'j-current',
  templateUrl: './current.component.html',
  styleUrls: ['./current.component.scss']
})
export class CurrentComponent {

  @Input() header: AppHeaderComponent;
  @Input() private memberOfCommunities: Community[];
  private _user: User;
  private selectedCommunityId: string;
  private communitiesToSelectFrom: Community[];
  private currentOrg: Organization;

  constructor(
    private myDetailsService: MyDetailsService, 
    private orgService: OrganizationService) {
  }

  ngOnChanges() {
      this.updateCommunitiesToSelectFrom();
  }


  @Input() set user( u:User ){
    this._user = u;
    if (u) {
      this.orgService.getById(u.organizationId).subscribe( org => {
        this.currentOrg = org.result;
      });
    }
  }

  getCurrentOrg(u:User){
    this.orgService.getById(u.organizationId).subscribe( org => {
      this.currentOrg = org.result;
    });
  }

  private change() {
    const user: User = {...this._user, currentCommunityId : this.selectedCommunityId};
    this.myDetailsService.updateCurrentUser(user).subscribe( data => {
      this.myDetailsService.getCurrentUser().subscribe ( data2 => {
        this._user = data2.result;
        this.updateCommunitiesToSelectFrom();
        this.header.refresh();
        //delete this.selectedCommunityId;
        this.selectedCommunityId=null;
        this.orgService.getById(this._user.organizationId).subscribe( org => {
          this.currentOrg = org.result;
        });
      });
      this._user.currentCommunityId = this.selectedCommunityId;
    });
  }

  private updateCommunitiesToSelectFrom(): void {
    this.selectedCommunityId=null;
    this.communitiesToSelectFrom = this.memberOfCommunities.filter(community => community.id != this._user.currentCommunityId);
  }
}
