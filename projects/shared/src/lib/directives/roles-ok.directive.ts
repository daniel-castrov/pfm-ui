import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

/**
 * Structural directive keeping the affected tag only if the user is authorized. Does nothing else. For use in menus.
 * Considers both the user roles and the current POM status.
 * Example usage:
 *    <span *menuRolesOk="'select-program-request'">POM_Manager</span>
 */
@Directive({
  selector: '[rolesOk]'
})
export class RolesOkDirective {

  private hasView = false;

  constructor( private templateRef: TemplateRef<any>, private viewContainerRef: ViewContainerRef) {}

  @Input() set rolesOk(url: string) {
    this.viewContainerRef.createEmbeddedView(this.templateRef);
    this.hasView = true;
  }

}


