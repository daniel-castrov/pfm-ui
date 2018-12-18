import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';
import {Authorization, AuthorizationResult} from "../services/authorization";

/**
 * Structural directive keeping the affected tag only if the user is authorized with AuthorizationResult.NotNow. Does nothing else. For use in menus.
 * Considers both the user roles and the current POM status.
 * Example usage:
 *    <span *menuRolesNotNow="'select-program-request'">POM_Manager</span>
 */
@Directive({
  selector: '[menuRolesNotNow]'
})
export class MenuRolesNotNowDirective {

  private hasView = false;

  constructor( private templateRef: TemplateRef<any>,
               private viewContainerRef: ViewContainerRef,
               private authorization: Authorization ) {}

  @Input() set menuRolesNotNow(url: string) {
    ( async () => {
      const auth = await this.authorization.forUrl(url);
      if (auth == AuthorizationResult.NotNow && !this.hasView) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (auth != AuthorizationResult.NotNow && this.hasView) {
        this.viewContainerRef.clear();
        this.hasView = false;
      }
    })()
  }

}


