import {Component, OnInit} from '@angular/core';
import {ElevationService} from '../../../services/elevation.component';
import {UserUtils} from "../../../services/user.utils";

@Component({
  selector: 'reports-menu',
  templateUrl: './reports-menu.component.html',
  styleUrls: ['./reports-menu.component.scss']
})
export class ReportsMenuComponent implements OnInit {

  roles: string[];

  constructor( public elevationService: ElevationService,
               private userUtils: UserUtils ) {}

  async ngOnInit() {
    this.roles = await this.userUtils.roles().toPromise();
  }
}
