import {Component, OnInit} from '@angular/core';
import {ElevationService} from '../../../services/elevation.component';
import {UserUtils} from "../../../services/user.utils";

@Component({
  selector: 'admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.scss']
})
export class AdminMenuComponent implements OnInit {

  roles: string[];

  constructor( public elevationService: ElevationService,
               private userUtils: UserUtils ) {}

  async ngOnInit() {
    this.roles = await this.userUtils.roles().toPromise();
  }
}
