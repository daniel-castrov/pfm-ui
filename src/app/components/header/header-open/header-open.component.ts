import { Component,Input } from '@angular/core';
import { onMainContentChange ,onSideNavChange, animateText} from '../../menu-bar/animation/animation';
import { MatSidenav, } from '@angular/material';
import { SidenavService } from '../../menu-bar/service/service';
@Component({
  selector: 'header-open',
  templateUrl: './header-open.component.html',
  styleUrls: ['./header-open.component.scss'],
  animations: [ onMainContentChange,onSideNavChange, animateText ]
})
export class HeaderOpenComponent {
  public onSideNavChange: boolean;
  @Input() sidenav: MatSidenav;
  public sideNavState: boolean = false;
  public linkText: boolean = false;

  constructor( 
    private service : SidenavService,) {
     this.service.sideNavState$.subscribe( res => {
       console.log(res)
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
}
