import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { VisibilityDef } from '../pfm-common-models/visibility-def.model';

/**
 * This service is intended to share useful information between any components.
 */
@Injectable({ providedIn: 'root' })
export class LocalVisibilityService {
  private visibilityDef: BehaviorSubject<VisibilityDef> = new BehaviorSubject({});

  constructor() {}

  getVisibilityDef(): Observable<VisibilityDef> {
    return this.visibilityDef.asObservable();
  }

  updateVisibilityDef(visibilityDef: VisibilityDef): void {
    const current = this.visibilityDef.getValue();
    this.visibilityDef.next({ ...current, ...visibilityDef });
  }

  clearVisibilityDef(): void {
    this.visibilityDef.next({});
  }
}
