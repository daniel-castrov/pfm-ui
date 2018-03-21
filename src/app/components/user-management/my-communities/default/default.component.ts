import { Component, Input, OnChanges } from '@angular/core';

// Generated
import { Community } from '../../../../generated';
import { User } from '../../../../generated';
import { MyDetailsService } from '../../../../generated/api/myDetails.service';

@Component({
  selector: 'default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent {

  @Input() private memberOfCommunities: Community[];
  @Input() private user: User;
  private selectedCommunityId: string;
  private communitiesToSelectFrom: Community[];

  constructor(private myDetailsService: MyDetailsService) {
  }

  ngOnChanges() {
      this.updateCommunitiesToSelectFrom();
  }

  private change() {
    const user: User = {...this.user, defaultCommunityId : this.selectedCommunityId};
    this.myDetailsService.updateCurrentUser(user).subscribe(() => {
      this.user.defaultCommunityId = this.selectedCommunityId;
      this.updateCommunitiesToSelectFrom();
      delete this.selectedCommunityId;
    });
  }

  private updateCommunitiesToSelectFrom(): void {
    this.communitiesToSelectFrom = this.memberOfCommunities.filter(community => community.id != this.user.defaultCommunityId);
  }
}
