import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AppModel } from '../../pfm-common-models/AppModel';

@Directive({
  selector: '[pfmIsVisible]'
})
export class IsVisibleDirective implements OnInit {
  isVisible = false;
  @Input() pfmIsVisible: string;

  /**
   * @param viewContainerRef
   *  -- the location where we need to render the templateRef
   * @param templateRef
   *   -- the templateRef to be potentially rendered
   * @param  appModel
   *   -- will give us access to user information including current active role
   */
  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private appModel: AppModel
  ) {}

  ngOnInit(): void {
    let showComponent: boolean;
    const visibilityDefIdParts = this.pfmIsVisible.split('.');
    const compositeId: string = visibilityDefIdParts[0];
    const componentId: string = visibilityDefIdParts[1];
    if (this.appModel['visibilityDef'][compositeId]) {
      showComponent = this.appModel['visibilityDef'][compositeId][componentId];
    }
    this.doVisibility(showComponent);
  }

  private doVisibility(showComponent: boolean) {
    if (showComponent) {
      if (!this.isVisible) {
        this.isVisible = true;
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    } else {
      this.isVisible = false;
      this.viewContainerRef.clear();
    }
  }
}
