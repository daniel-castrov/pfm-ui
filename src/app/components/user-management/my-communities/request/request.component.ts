import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

// Generated
import { Community, RestResult, User, Organization, OrganizationService } from '../../../../generated';
import { HeaderComponent } from '../../../header/header.component';
import { FeedbackComponent } from '../../../feedback/feedback.component';

@Component({
  selector: 'j-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent implements OnChanges {

  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;
  @Input() allCommunities: Community[];
  @Input() user: User;
  @Input() service: any;
  @Input() useOrgs: boolean;
  @Input() header: HeaderComponent;
  
  availableCommunities: Community[];
  requestedCommunities: Community[];
  selectedCommunity: Community = null;
  organizations: Organization[] = [];
  selectedOrg:Organization = null;

  constructor( private orgService: OrganizationService){
    this.organizations=[];
  }

  getOrganizations(){
    this.orgService.getByCommunityId(this.selectedCommunity.id)
    .subscribe( data => {
      this.organizations = data.result;
    });
  }

  ready(){
    if (this.useOrgs){
      return !( this.selectedCommunity && this.selectedOrg );
    } 
    else return !( this.selectedCommunity );
  }

  ngOnChanges() {
    if(this.user) {
      this.updateRequestedCommuntyIds();
    }
  }

  private async createRequest() {
    const request: any = {};
    request.userId = this.user.id;
    request.communityId = this.selectedCommunity.id;
    if (this.useOrgs){ request.organizationId=this.selectedOrg.id; }
    try {
      await this.service.create(request).toPromise();
      this.feedback.success("You will receive an email once your request is processed.");
      this.updateRequestedCommuntyIds();
      this.header.refreshActions();
    } catch(e) {
      this.feedback.exception(e.message);
    }
    this.selectedCommunity=null;
    this.selectedOrg=null;
  }

  private updateRequestedCommuntyIds() {
    this.service.getByUser(this.user.id).subscribe( (response: RestResult) => {
      let requests:any = response.result;
      this.availableCommunities = [...this.allCommunities];
      this.requestedCommunities = [];

      requests.forEach( (request:{id:string, communityId:string}) => {
        // remove the community of the current request from this.availableCommunities
        this.availableCommunities = this.availableCommunities.filter((community) => community.id != request.communityId);

        // add the the community of the current request to this.requestedCommunities
        const requestedCommunities: Community[] = this.allCommunities.filter((community) => community.id == request.communityId);
        this.requestedCommunities.push(...requestedCommunities);
      });
    });
  }

}
