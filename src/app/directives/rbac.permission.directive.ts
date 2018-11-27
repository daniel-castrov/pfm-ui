import { Directive, ElementRef, Input, AfterViewInit  } from '@angular/core';
import { RolesPermissionsService } from '../generated'

@Directive({
  selector: '[apppermission]'
})
export class RbacPermissionDirective  implements AfterViewInit {


  @Input('apppermission') permission:string;

  constructor(
    private el: ElementRef,
    private rpsvc:RolesPermissionsService
    ) {} 

  async ngAfterViewInit(){
    this.determinVisibility();
  }

  async determinVisibility(){
    let data = await this.rpsvc.hasPermission(this.permission).toPromise();
    let show = data.result;
    if (show === "false"){
      //this.el.nativeElement.style.display = "none";
      //this.el.nativeElement.innerHTML = "";
      this.el.nativeElement.remove();
    }
  }

}
