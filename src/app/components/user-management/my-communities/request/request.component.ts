import { Component, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';

// Generated
import { Community, RestResult, User } from '../../../../generated';

@Component({
  selector: 'request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent implements OnChanges {

  @Input() allCommunities: Community[];
  @Input() user: User;
  @Input() service: any;
  availableCommunities: Community[];
  requestedCommunities: Community[];
  selectedCommunityId: string;
  messageIsHidden: boolean = true;

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
      this.messageIsHidden = false;
      setInterval(() => this.messageIsHidden = true, 5000);
      this.updateRequestedCommuntyIds();
    });
    delete this.selectedCommunityId;
  }

  private updateRequestedCommuntyIds() {
    this.service.getByUser(this.user.id).subscribe( (response: RestResult) => {
      this.availableCommunities = [...this.allCommunities];
      this.requestedCommunities = [];
      response.result.forEach(request => {
        // remove the community of the current request from this.availableCommunities
        this.availableCommunities = this.availableCommunities.filter((community) => community.id != request.communityId);

        // add the the community of the current request to this.requestedCommunities
        const requestedCommunities: Community[] = this.allCommunities.filter((community) => community.id == request.communityId);
        this.requestedCommunities.push(...requestedCommunities);
      });
    });
  }

}
