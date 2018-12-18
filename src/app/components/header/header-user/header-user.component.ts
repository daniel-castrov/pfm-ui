import {Component, Input, ViewChild} from '@angular/core';
import {ElevationService} from '../../../services/elevation.component';
import {AuthUser} from '../../../generated/model/authUser';
import {MenuBarComponent} from "../../menu-bar/menu-bar.component";

@Component({
  selector: 'header-user',
  templateUrl: './header-user.component.html',
  styleUrls: ['./header-user.component.scss']
})
export class HeaderUserComponent {

  @Input() isAuthenticated: boolean;
  @Input() authUser: AuthUser;

  @ViewChild(MenuBarComponent) menuBarComponent: MenuBarComponent;

  constructor( public elevationService: ElevationService ) {}

}
