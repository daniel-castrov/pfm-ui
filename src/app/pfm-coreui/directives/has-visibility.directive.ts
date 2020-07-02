import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { LocalVisibilityService } from 'src/app/core/local-visibility.service';

/**
 * @whatItDoes Conditionally includes an HTML element if current user has
 * permission to see visibilityDef in `expression`.
 *
 * @howToUse
 * ```
 *     <some-element *pfmHasVisibility="'budget-phase-component.createBudget'">...</some-element>
 * ```
 */
@Directive({
  selector: '[pfmHasVisibility]'
})
export class HasVisibilityDirective implements OnDestroy {
  private componentPath: string;
  private appModelSubscription: Subscription;

  constructor(
    private localVisibilityService: LocalVisibilityService,
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef
  ) {}

  @Input()
  set pfmHasVisibility(value: string) {
    this.componentPath = value;
    this.updateView({});
    // Get notified each time authentication state changes.
    this.appModelSubscription = this.localVisibilityService
      .getVisibilityDef()
      .subscribe(visibilityDef => this.updateView(visibilityDef));
  }

  ngOnDestroy(): void {
    if (this.appModelSubscription) {
      this.appModelSubscription.unsubscribe();
    }
  }

  private updateView(visibilityDef: any): void {
    const [compositeId, componentId] = (this.componentPath ?? '').split('.');
    const hasVisibility = visibilityDef[compositeId] ? visibilityDef[compositeId][componentId] : false;
    this.viewContainerRef.clear();
    if (hasVisibility) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
  }
}
