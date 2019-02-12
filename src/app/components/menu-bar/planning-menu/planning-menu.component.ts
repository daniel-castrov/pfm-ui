import {Component, OnInit} from '@angular/core';
import {ElevationService} from '../../../services/elevation.component';
import {UserUtils} from "../../../services/user.utils";

@Component({
  selector: 'planning-menu',
  templateUrl: './planning-menu.component.html',
  styleUrls: ['./planning-menu.component.scss']
})
export class PlanningMenuComponent implements OnInit {

  roles: string[];

  constructor( public elevationService: ElevationService,
               private userUtils: UserUtils) {}

  async ngOnInit() {
    this.roles = await this.userUtils.roles().toPromise();
  }
}
