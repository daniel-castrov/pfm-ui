import { Component, Input } from '@angular/core';
import { AuthUser } from '../../../../generated/model/authUser';

@Component({
  selector: 'j-no-current-community-message',
  templateUrl: './no-current-community-message.component.html',
  styleUrls: ['./no-current-community-message.component.css']
})
export class NoCurrentCommunityMessageComponent {

  @Input() authUser: AuthUser;

}
