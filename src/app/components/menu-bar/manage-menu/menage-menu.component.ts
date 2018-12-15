import {Component, OnInit} from '@angular/core';
import {ElevationService} from '../../../services/elevation.component';
import {UserUtils} from "../../../services/user.utils";

@Component({
  selector: 'menage-menu',
  templateUrl: './menage-menu.component.html',
  styleUrls: ['./menage-menu.component.scss']
})
export class MenageMenuComponent implements OnInit {

  roles: string[];

  constructor( public elevationService: ElevationService,
               private userUtils: UserUtils ) {}

  async ngOnInit() {
    this.roles = await this.userUtils.roles().toPromise();
  }
}
