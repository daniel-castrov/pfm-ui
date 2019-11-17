import { Component, Input, OnInit } from '@angular/core';
import { UserRole } from '../../../../projects/shared/src/lib/models/UserRole';
import { animateText } from './animation';
import { MenuBarItem } from '../models/MenuBarItem';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'pfm-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss'],
  animations: [ animateText ]
})
export class MenuBarComponent implements OnInit {

  @Input() linkText: boolean;
  @Input() role:UserRole;
  @Input() elevatedBoolean;
  @Input() isUserSignedIn:boolean;

  //TODO - notice that this can be data-driven from a service, example below
  @Input() menuBarItems:MenuBarItem[];

  isDashboardSelected:boolean;
  isPlanningSelected:boolean;

  constructor(private router: Router) {

  }

  ngOnInit() {
    this.router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        if(event.url.startsWith('/planning')){
          this.isDashboardSelected = false;
          this.isPlanningSelected = true;
        }
        else if(event.url.startsWith('/home')){
          this.isPlanningSelected = false;
          this.isDashboardSelected = true;
        }
        console.info(JSON.stringify(event));
      }
    });
  }


}
