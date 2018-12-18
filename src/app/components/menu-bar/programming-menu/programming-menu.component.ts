import {Component, Input, OnInit} from '@angular/core';
import {ElevationService} from '../../../services/elevation.component';
import {Pom} from '../../../generated/model/pom';
import {UserUtils} from "../../../services/user.utils";

@Component({
  selector: 'programming-menu',
  templateUrl: './programming-menu.component.html',
  styleUrls: ['./programming-menu.component.scss']
})
export class ProgrammingMenuComponent implements OnInit {

  @Input() pomStatus: Pom.StatusEnum;
  roles: string[];

  constructor( public elevationService: ElevationService,
               private userUtils: UserUtils  ) {}

  async ngOnInit() {
    this.roles = await this.userUtils.roles().toPromise();
  }
}
