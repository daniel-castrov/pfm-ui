import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {Authorization, AuthorizationResult} from "../services/authorization";

@Injectable()
export class CanActivateAuth {

  constructor( private authorization: Authorization, private router: Router ) {}

  async canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
      const auth = await this.authorization.forUrl(route.routeConfig.path);
      if (auth !== AuthorizationResult.Ok) {
        this.router.navigate(['/no-access']);
      }
      return auth == AuthorizationResult.Ok;
  }

}
