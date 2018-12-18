import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import {UserUtils} from "../services/user.utils";

/**
 * Structural directive removing the affected component if the user does not have any of the roles required,
 * i.e. keeps the component if the user is role-based authorized. Does not consider the POM status.
 * Example usage:
 *    <span *roles="'POM_Manager,User'">POM_Manager</span>
 */
@Directive({
  selector: '[roles]'
})
export class RbacRoleDirective {

  private hasView = false;

  constructor( private templateRef: TemplateRef<any>,
               private viewContainerRef: ViewContainerRef,
               private userUtils: UserUtils ) {}

  @Input() set roles(roles: string) {
    roles = roles.trim();
    const rolesArray = roles.split(",");
    ( async () => {
      const hasRole = await this.userUtils.hasAnyOfTheseRoles(...rolesArray).toPromise();
      if (hasRole && !this.hasView) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!hasRole && this.hasView) {
        this.viewContainerRef.clear();
        this.hasView = false;
      }
    })()
  }

}


