import { Component, Input, OnChanges, ViewChild } from '@angular/core';

// Generated
import { HeaderComponent } from '../../../header/header.component';
import { Community } from '../../../../generated';
import { User } from '../../../../generated';
import { MyDetailsService } from '../../../../generated/api/myDetails.service';
import { OrganizationService } from '../../../../generated/api/organization.service';
import { Organization } from '../../../../generated';


@Component({
  selector: 'j-current',
  templateUrl: './current.component.html',
  styleUrls: ['./current.component.scss']
})
export class CurrentComponent {

  @Input() header: HeaderComponent;
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
      this.orgService.get(u.organizationId).subscribe( org => {
        this.currentOrg = org.result;
      });
    }
  }

  getCurrentOrg(u:User){
    this.orgService.get(u.organizationId).subscribe( org => {
      this.currentOrg = org.result;
    });
  }

  private change() {
    const user: User = {...this._user, currentCommunityId : this.selectedCommunityId};
    this.myDetailsService.updateCurrentUser(user).subscribe( data => {
      this.myDetailsService.getCurrentUser().subscribe ( data2 => {
        this._user = data2.result;
        this.updateCommunitiesToSelectFrom();
        this.header.refreshActions();
        delete this.selectedCommunityId;
        this.orgService.get(this._user.organizationId).subscribe( org => {
          this.currentOrg = org.result;
        });
      });


      this._user.currentCommunityId = this.selectedCommunityId;
      
      
    });
  }

  private updateCommunitiesToSelectFrom(): void {
    this.communitiesToSelectFrom = this.memberOfCommunities.filter(community => community.id != this._user.currentCommunityId);
  }
}
