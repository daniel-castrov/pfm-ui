import {Component, OnInit} from '@angular/core';
import {ElevationService} from "../../../services/elevation.component";
import {UserUtils} from "../../../services/user.utils";

@Component({
  selector: 'budget-menu',
  templateUrl: './budget-menu.component.html',
  styleUrls: ['./budget-menu.component.scss']
})
export class BudgetMenuComponent implements OnInit {

  roles: string[];

  constructor( public elevationService: ElevationService,
               private userUtils: UserUtils  ) {}

  async ngOnInit() {
    this.roles = await this.userUtils.roles().toPromise();
  }

}
