import { Directive, ElementRef, Input, AfterViewInit  } from '@angular/core';
import { RolesPermissionsService } from '../generated'

@Directive({
  selector: '[approle]'
})
export class RbacRoleDirective {


  @Input('approle') role: string;

  constructor(
    private el: ElementRef,
    private rpsvc:RolesPermissionsService
    ) {}

  ngAfterViewInit(){

    this.role=this.role.trim();
    let roles:string[] = this.role.split(",");
    if  (roles.length<1){ }
    if (roles.length==1){
      this.determinVisibility_single(this.role);
    } 
    if ( roles.length>1 ){
      this.determinVisibility_multiple(this.role);
    }

  }

  async determinVisibility_single(rolename){
    let data = await this.rpsvc.hasRole(rolename).toPromise();
    let hide = data.result;
    //console.log(hide);    
    if (hide==="false"){
      this.el.nativeElement.style.display = "none";
    }
  }

  async determinVisibility_multiple(rolenames){
    let data = await this.rpsvc.hasRoles(rolenames).toPromise();
    let results:string[] =  data.result;
    for (let i=0; i<results.length; i++){
      if (results[i]){
        return;
      }
    };
    this.el.nativeElement.style.display = "none";
  }

}