import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

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

  private _memberOfCommunities: Community[] = [];
  private _user: User;
  private selectedCommunityId: string;
  private communitiesToSelectFrom: Community[];

  constructor(private myDetailsService: MyDetailsService) {
  }

  @Input()
  set user(user) {
    this._user = user;
    this.updateCommunitiesToSelectFrom();
  }
  
  @Input()
  set memberOfCommunities(id) {
    this._memberOfCommunities = id;
    this.updateCommunitiesToSelectFrom();
  }
  
  private change() {
    this._user.defaultCommunityId = this.selectedCommunityId;
    this.myDetailsService.updateCurrentUser(this._user).subscribe();
    this.updateCommunitiesToSelectFrom();
  }
  
  private updateCommunitiesToSelectFrom(): void {
    this.communitiesToSelectFrom = this._memberOfCommunities.filter(community => community.id != this._user.defaultCommunityId);
  }
}
