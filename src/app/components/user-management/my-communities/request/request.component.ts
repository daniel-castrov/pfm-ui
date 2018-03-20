import { Component, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';

// Generated
import { Community, RestResult, User } from '../../../../generated';

@Component({
  selector: 'request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})
export class RequestComponent implements OnChanges {

  @Input() communities: Community[];
  @Input() user: User;
  @Input() service: any;
  requestedCommunityIds: Set<string> = new Set<string>();
  selectedCommunityId: string;

  ngOnChanges() {
    if(this.user) {
      this.updateRequestedCommuntyIds();
    }
  }

  private createRequest() {
    const request: any = {};
    request.userId = this.user.id;
    request.communityId = this.selectedCommunityId;
    this.service.create(request).subscribe(() => this.updateRequestedCommuntyIds());
    delete this.selectedCommunityId;
  }

  private updateRequestedCommuntyIds() {
    this.requestedCommunityIds.clear();
    this.service.getByUser(this.user.id).subscribe( (response: RestResult) =>
      response.result.forEach(request => this.requestedCommunityIds.add(request.communityId))
    );
  }

  private disabled(communityId: string): boolean {
    return this.requestedCommunityIds.has(communityId) || this.user.defaultCommunityId==communityId;
  }

}
