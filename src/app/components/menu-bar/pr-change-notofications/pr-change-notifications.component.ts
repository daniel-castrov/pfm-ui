import {Component, OnInit} from '@angular/core';
import {PrChangeNotification, PrChangeNotificationsService} from "../../../generated";

@Component({
  selector: 'pr-change-notifications',
  templateUrl: './pr-change-notifications.component.html',
  styleUrls: ['./pr-change-notifications.component.scss']
})
export class PrChangeNotificationsComponent implements OnInit {

  prChangeNotifications: PrChangeNotification[];

  constructor( private prChangeNotificationsService: PrChangeNotificationsService ) {}

  async ngOnInit() {
      this.prChangeNotifications = (await this.prChangeNotificationsService.getByOrganization().toPromise()).result;
  }

}
