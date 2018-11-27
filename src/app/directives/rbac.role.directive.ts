import {AfterViewInit, Directive, ElementRef, Input} from '@angular/core';
import {UserUtils} from "../services/user.utils";

@Directive({
  selector: '[approle]'
})
export class RbacRoleDirective implements AfterViewInit {

  @Input('approle') roles: string;

  constructor( private el: ElementRef,
               private userUtils: UserUtils ) {}

  async ngAfterViewInit() {
    this.roles=this.roles.trim();
    const roles = this.roles.split(",");
    const hasRole = await this.userUtils.hasAnyOfTheseRoles(roles).toPromise();
    if (!hasRole) {
      this.el.nativeElement.remove();
    } 
  }

}
