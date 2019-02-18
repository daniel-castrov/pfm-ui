import {Budget, Pom} from './../generated';
import {UserUtils} from './user.utils';
import {Injectable} from '@angular/core';
import {CurrentPhase} from "./current-phase.service";
import {ElevationService} from "./elevation.component";

export enum AuthorizationResult {
  Ok,     // authorized
  NotNow, // temporarily not authorized because of the current POM state; could be authorized in the future because the roles allow authorization
  Never   // (largely) permanently not authorized because of lack of roles
}

/**
 * The name of the class Authorization is too narrow. This class reports the availability of menu items and URLs based on not only
 * authorization data but also on the current phases state.
 *
 * ToDo: Rename this class to reflect the above.
 */
@Injectable()
export class Authorization {

  constructor( public elevationService: ElevationService,
               private userUtils: UserUtils,
               private currentPhase: CurrentPhase ) {}

  forUrl(url: string): Promise<AuthorizationResult> {
    if(this[url]) {
      return this[url]();
    } else {
      console.warn('Authorization requested for a URL that is not set up for authorization');
      return Promise.resolve(AuthorizationResult.Ok);
    }
  }

  async 'select-program-request'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if ([Pom.StatusEnum.CREATED, Pom.StatusEnum.OPEN, Pom.StatusEnum.RECONCILIATION].includes((await this.currentPhase.pom().toPromise()).status) ) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    if(await this.userUtils.hasAnyOfTheseRoles('Funds_Requestor').toPromise()) {
      if ([Pom.StatusEnum.CREATED, Pom.StatusEnum.OPEN, Pom.StatusEnum.RECONCILIATION].includes((await this.currentPhase.pom().toPromise()).status) ) return AuthorizationResult.Ok;
      return AuthorizationResult.Never;
    }
    return AuthorizationResult.Never;
  }

  async 'ufr-search'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if ([Pom.StatusEnum.CREATED, Pom.StatusEnum.OPEN, Pom.StatusEnum.RECONCILIATION].includes((await this.currentPhase.pom().toPromise()).status) ) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    if(await this.userUtils.hasAnyOfTheseRoles('Funds_Requestor').toPromise()) {
      if ([Pom.StatusEnum.CREATED, Pom.StatusEnum.OPEN, Pom.StatusEnum.RECONCILIATION].includes((await this.currentPhase.pom().toPromise()).status) ) return AuthorizationResult.Ok;
      return AuthorizationResult.Never;
    }
    return AuthorizationResult.Never;
  }

  async 'create-new-pom'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if (Pom.StatusEnum.CLOSED == (await this.currentPhase.pom().toPromise()).status) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'open-pom-session'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if (Pom.StatusEnum.CREATED == (await this.currentPhase.pom().toPromise()).status) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'update-pom-session'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if (Pom.StatusEnum.OPEN == (await this.currentPhase.pom().toPromise()).status) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'lock-pom-session'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if (Pom.StatusEnum.OPEN == (await this.currentPhase.pom().toPromise()).status) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'close-pom-session'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if (Pom.StatusEnum.RECONCILIATION == (await this.currentPhase.pom().toPromise()).status) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'update-toa'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if ([Pom.StatusEnum.CREATED, Pom.StatusEnum.OPEN].includes( (await this.currentPhase.pom().toPromise()).status) ) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'worksheet-management'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if (Pom.StatusEnum.OPEN == (await this.currentPhase.pom().toPromise()).status) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'worksheet-viewing'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if (Pom.StatusEnum.RECONCILIATION == (await this.currentPhase.pom().toPromise()).status) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'ufr-approval-summary'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if ([Pom.StatusEnum.OPEN, Pom.StatusEnum.RECONCILIATION].includes( (await this.currentPhase.pom().toPromise()).status) ) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'create-budget'(): Promise<AuthorizationResult> {
    if(await this.userUtils.hasAnyOfTheseRoles('Budget_Manager').toPromise()) {
      const pom = (await this.currentPhase.pom().toPromise());
      const budget = (await this.currentPhase.budget().toPromise());
      if ([Pom.StatusEnum.CLOSED, Pom.StatusEnum.RECONCILIATION].includes( pom.status) )
        if( Budget.StatusEnum.CLOSED == budget && budget.status )
          if(pom.fy == budget.fy+1)
            return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'budget-scenarios'(): Promise<AuthorizationResult> {
    if(await this.userUtils.hasAnyOfTheseRoles('Budget_Manager').toPromise()) {
      const budget = (await this.currentPhase.budget().toPromise());
      if( Budget.StatusEnum.CLOSED == budget && budget.status )
        return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'edit-budget-scenario'(): Promise<AuthorizationResult> {
    if(await this.userUtils.hasAnyOfTheseRoles('Budget_Manager').toPromise()) {
      const budget = (await this.currentPhase.budget().toPromise());
        return AuthorizationResult.Ok;
    }
    return AuthorizationResult.Never;
  }


}
