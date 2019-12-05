import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserRole } from '../../pfm-common-models/UserRole';
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
  @Input() menuBarItems:MenuBarItem[];
  @Output() onMenuToogle:EventEmitter<boolean> = new EventEmitter<boolean>();

  isOpen:boolean;
  isDashboardSelected:boolean;
  isPlanningSelected:boolean;
  isProgrammingSelected
  isBudgetSelected:boolean;
  isExecutionSelected:boolean;
  isReportsSelected:boolean;
  isManageSelected:boolean;
  isAdminSelected:boolean;
  selectedItem:string;

  constructor(private router: Router) {

  }

  onSelect(name:string):void{
    this.selectedItem = name;
    if(name){
      this.isDashboardSelected = false;
      this.isPlanningSelected = false;
      this.isProgrammingSelected = false;
      this.isBudgetSelected = false;
      this.isExecutionSelected = false;
      this.isReportsSelected = false;
      this.isManageSelected = false;
      this.isAdminSelected = false;

      if(name === 'Dashboard'){
        this.isDashboardSelected = true;
      }
      else if(name === 'Planning'){
        this.isPlanningSelected = true;
      }
      else if(name === 'Programming'){
        this.isProgrammingSelected = true;
      }
      else if(name === 'Budget'){
        this.isBudgetSelected = true;
      }
      else if(name === 'Reports'){
        this.isReportsSelected = true;
      }
      else if(name === 'Manage'){
        this.isManageSelected = true;
      }
      else if(name === 'Admin'){
        this.isAdminSelected = true;
      }
    }
  }

  toogleMenu() {
    this.isOpen = !this.isOpen;
    this.onMenuToogle.emit(this.isOpen);

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
      }
    });
  }


}
