import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

// Generated
import { Community } from '../../../../generated';
import { User } from '../../../../generated';

@Component({
  selector: 'request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})
export class RequestComponent {

  @Input() communities: Community[] = [];
  requestedCommunityIds: Set<Community>;
  @Input() user: User;
  @Input() service: any;
  selectedCommunityId: string;

  private createRequest() {
    const request: any = {};
    request.userId = this.user.id;
    request.communityId = this.selectedCommunityId;
    console.log(request);
    this.service.create(request).subscribe();
  }

}
