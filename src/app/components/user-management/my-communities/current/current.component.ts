import { Component, Input, OnChanges, ViewChild } from '@angular/core';

// Generated
import { HeaderComponent } from '../../../../components/header/header.component';
import { Community } from '../../../../generated';
import { User } from '../../../../generated';
import { MyDetailsService } from '../../../../generated/api/myDetails.service';

@Component({
  selector: 'current',
  templateUrl: './current.component.html',
  styleUrls: ['./current.component.scss']
})
export class CurrentComponent {

  @Input() header: HeaderComponent;
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
    const user: User = {...this.user, currentCommunityId : this.selectedCommunityId};
    this.myDetailsService.updateCurrentUser(user).subscribe(() => {
      this.user.currentCommunityId = this.selectedCommunityId;
      this.updateCommunitiesToSelectFrom();
      this.header.ngOnInit();
      delete this.selectedCommunityId;
    });
  }

  private updateCommunitiesToSelectFrom(): void {
    this.communitiesToSelectFrom = this.memberOfCommunities.filter(community => community.id != this.user.currentCommunityId);
  }
}
