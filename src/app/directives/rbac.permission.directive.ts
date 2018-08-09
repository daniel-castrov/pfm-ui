import { Directive, ElementRef, Input, AfterViewInit  } from '@angular/core';
import { RolesPermissionsService } from '../generated'

@Directive({
  selector: '[apppermission]'
})
export class RbacPermissionDirective {


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
    let hide = data.result;  
    if (hide==="false"){
      this.el.nativeElement.style.display = "none";
    }
  }

}