import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { SpyObject } from './spyobject';
import { Observable, of } from 'rxjs';
import Spy = jasmine.Spy;

export class MockActivatedRoute extends ActivatedRoute {
  constructor(parameters?: any) {
    super();
    this.snapshot = ({
      paramMap: new Map([['id', '123']])
    } as any) as ActivatedRouteSnapshot;
    this.queryParams = of(parameters);
    this.params = of(parameters);
  }
}

export class MockRouter extends SpyObject {
  navigateSpy: Spy;
  navigateByUrlSpy: Spy;
  events: Observable<any>;

  constructor() {
    super(Router);
    this.navigateSpy = this.spy('navigate');
    this.navigateByUrlSpy = this.spy('navigateByUrl');
  }

  setRouterEvent(event: any) {
    this.events = of(event);
  }
}
