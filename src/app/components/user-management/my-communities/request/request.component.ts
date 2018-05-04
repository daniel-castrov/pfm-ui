import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

// Generated
import { Community, RestResult, User } from '../../../../generated';
import { HeaderComponent } from '../../../header/header.component';
import { FeedbackComponent } from '../../../feedback/feedback.component';

@Component({
  selector: 'j-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent implements OnChanges {

  @Input() allCommunities: Community[];
  @Input() user: User;
  @Input() service: any;
  @Input() header: HeaderComponent;
  availableCommunities: Community[];
  requestedCommunities: Community[];
  selectedCommunityId: string;
  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;

  ngOnChanges() {
    if(this.user) {
      this.updateRequestedCommuntyIds();
    }
  }

  private createRequest() {
    const request: any = {};
    request.userId = this.user.id;
    request.communityId = this.selectedCommunityId;
    this.service.create(request).subscribe(() => {
      this.feedback.flash("You will receive an email once your request is processed.");
      this.updateRequestedCommuntyIds();
      this.header.refreshActions();
    });
    delete this.selectedCommunityId;
  }

  private updateRequestedCommuntyIds() {
    this.service.getByUser(this.user.id).subscribe( (response: RestResult) => {
      this.availableCommunities = [...this.allCommunities];
      this.requestedCommunities = [];
      response.result.forEach( (request:{id:string, communityId:string}) => {
        // remove the community of the current request from this.availableCommunities
        this.availableCommunities = this.availableCommunities.filter((community) => community.id != request.communityId);

        // add the the community of the current request to this.requestedCommunities
        const requestedCommunities: Community[] = this.allCommunities.filter((community) => community.id == request.communityId);
        this.requestedCommunities.push(...requestedCommunities);
      });
    });
  }

}
