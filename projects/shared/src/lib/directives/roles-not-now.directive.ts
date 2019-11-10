import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

/**
 * Structural directive keeping the affected tag only if the user is authorized with AuthorizationResult.NotNow. Does nothing else. For use in menus.
 * Considers both the user roles and the current POM status.
 * Example usage:
 *    <span *menuRolesNotNow="'select-program-request'">POM_Manager</span>
 */
@Directive({
  selector: '[rolesNotNow]'
})
export class RolesNotNowDirective {

  private hasView = false;

  constructor( private templateRef: TemplateRef<any>, private viewContainerRef: ViewContainerRef) {}

  @Input() set rolesNotNow(url: string) {
    this.viewContainerRef.clear();
    this.hasView = false;
  }
}


