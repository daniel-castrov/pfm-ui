import { Component, Input, OnInit } from '@angular/core';
import { UserRole } from '../../../../projects/shared/src/lib/models/UserRole';
import { animateText } from './animation';
import { MenuBarItem } from '../models/MenuBarItem';

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

  constructor() { }

  ngOnInit() {
  }

}
