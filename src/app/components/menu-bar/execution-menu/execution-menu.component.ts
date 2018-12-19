import {Component, OnInit} from '@angular/core';
import {ElevationService} from '../../../services/elevation.component';
import {UserUtils} from "../../../services/user.utils";

@Component({
  selector: 'execution-menu',
  templateUrl: './execution-menu.component.html',
  styleUrls: ['./execution-menu.component.scss']
})
export class ExecutionMenuComponent implements OnInit {

  roles: string[];

  constructor( public elevationService: ElevationService,
               private userUtils: UserUtils ) {}

  async ngOnInit() {
    this.roles = await this.userUtils.roles().toPromise();
  }
}
