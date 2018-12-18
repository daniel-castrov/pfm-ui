import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {Authorization, AuthorizationResult} from "../services/authorization";

@Injectable()
export class CanActivateAuth {

  constructor( private authorization: Authorization ) {}

  async canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
      const auth = await this.authorization.forUrl(route.routeConfig.path);
      return auth == AuthorizationResult.Ok;
  }

}
