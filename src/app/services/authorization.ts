import {Pom} from './../generated';
import {UserUtils} from './user.utils';
import {Injectable} from '@angular/core';
import {PomUtils} from "./pom.utils";
import {ElevationService} from "./elevation.component";

export enum AuthorizationResult {
  Ok,     // authorized
  NotNow, // temporarily not authorized because of the current POM state; could be authorized in the future because the roles allow authorization
  Never   // (largely) permanently not authorized because of lack of roles
}

@Injectable()
export class Authorization {

  constructor( public elevationService: ElevationService,
               private userUtils: UserUtils,
               private pomUtils: PomUtils ) {}

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
      if ([Pom.StatusEnum.CREATED, Pom.StatusEnum.OPEN, Pom.StatusEnum.RECONCILIATION].includes((await this.pomUtils.currentPom().toPromise()).status) ) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    if(await this.userUtils.hasAnyOfTheseRoles('Funds_Requestor').toPromise()) {
      if ([Pom.StatusEnum.CREATED, Pom.StatusEnum.OPEN, Pom.StatusEnum.RECONCILIATION].includes((await this.pomUtils.currentPom().toPromise()).status) ) return AuthorizationResult.Ok;
      return AuthorizationResult.Never;
    }
    return AuthorizationResult.Never;
  }

  async 'ufr-search'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if ([Pom.StatusEnum.CREATED, Pom.StatusEnum.OPEN, Pom.StatusEnum.RECONCILIATION].includes((await this.pomUtils.currentPom().toPromise()).status) ) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    if(await this.userUtils.hasAnyOfTheseRoles('Funds_Requestor').toPromise()) {
      if ([Pom.StatusEnum.CREATED, Pom.StatusEnum.OPEN, Pom.StatusEnum.RECONCILIATION].includes((await this.pomUtils.currentPom().toPromise()).status) ) return AuthorizationResult.Ok;
      return AuthorizationResult.Never;
    }
    return AuthorizationResult.Never;
  }

  async 'create-new-pom'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if (Pom.StatusEnum.CLOSED == (await this.pomUtils.currentPom().toPromise()).status) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'open-pom-session'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if (Pom.StatusEnum.CREATED == (await this.pomUtils.currentPom().toPromise()).status) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'update-pom-session'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if (Pom.StatusEnum.OPEN == (await this.pomUtils.currentPom().toPromise()).status) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'lock-pom-session'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if (Pom.StatusEnum.OPEN == (await this.pomUtils.currentPom().toPromise()).status) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'close-pom-session'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if (Pom.StatusEnum.RECONCILIATION == (await this.pomUtils.currentPom().toPromise()).status) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'update-toa'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if ([Pom.StatusEnum.CREATED, Pom.StatusEnum.OPEN].includes( (await this.pomUtils.currentPom().toPromise()).status) ) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'worksheet-management'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if (Pom.StatusEnum.OPEN == (await this.pomUtils.currentPom().toPromise()).status) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'worksheet-viewing'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if (Pom.StatusEnum.RECONCILIATION == (await this.pomUtils.currentPom().toPromise()).status) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }

  async 'ufr-approval-summary'(): Promise<AuthorizationResult> {
    if(this.elevationService.elevatedBoolean) return AuthorizationResult.NotNow;
    if(await this.userUtils.hasAnyOfTheseRoles('POM_Manager').toPromise()) {
      if ([Pom.StatusEnum.OPEN, Pom.StatusEnum.RECONCILIATION].includes( (await this.pomUtils.currentPom().toPromise()).status) ) return AuthorizationResult.Ok;
      return AuthorizationResult.NotNow;
    }
    return AuthorizationResult.Never;
  }


}
