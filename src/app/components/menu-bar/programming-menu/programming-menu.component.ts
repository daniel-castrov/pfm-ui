import {Component, Input, OnInit} from '@angular/core';
import {RequestsService} from '../../../services/requests.service';
import {ElevationService} from '../../../services/elevation.component';
import {POMService} from '../../../generated/api/pOM.service';
import {Pom} from '../../../generated/model/pom';
import {PrChangeNotificationsService} from "../../../generated";
import {UserUtils} from "../../../services/user.utils";

@Component({
  selector: 'programming-menu',
  templateUrl: './programming-menu.component.html',
  styleUrls: ['./programming-menu.component.scss']
})
export class ProgrammingMenuComponent implements OnInit {

  @Input() pomStatus: Pom.StatusEnum;
  roles: string[];

  constructor( private requestsService: RequestsService,
               public elevationService: ElevationService,
               private pomService: POMService,
               private userUtils: UserUtils,
               private prChangeNotificationsService: PrChangeNotificationsService ) {}

  async ngOnInit() {
    this.roles = await this.userUtils.roles().toPromise();
  }
}
