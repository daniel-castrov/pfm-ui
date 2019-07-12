import { Component,Input,OnInit } from '@angular/core';
import { onMainContentChange ,onSideNavChange, animateText} from '../../menu-bar/animation/animation';
import { MatSidenav, } from '@angular/material';
import { SidenavService } from '../../menu-bar/service/service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  animations: [ onMainContentChange,onSideNavChange, animateText ]
})
export class SidebarMenuComponent implements OnInit {
    public onSideNavChange: boolean;
    @Input() sidenav: MatSidenav;
    public sideNavState: boolean = false;
    public linkText: boolean = false;
  
    constructor( 
      private service : SidenavService,) {
       this.service.sideNavState$.subscribe( res => {
         this.onSideNavChange = res;
       })
      }
  
      onSinenavToggle() {
        this.sideNavState = !this.sideNavState
        
        setTimeout(() => {
          this.linkText = this.sideNavState;
        }, 200)
        this.service.sideNavState$.next(this.sideNavState)
      }
  ngOnInit() {
  }
}
