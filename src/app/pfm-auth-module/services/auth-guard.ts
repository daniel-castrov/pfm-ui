import { Injectable } from '@angular/core';
import { AuthorizationService } from './authorization.service';
import { CanActivate, Router } from '@angular/router';

@Injectable()
export class AuthGuard  implements CanActivate{

  constructor(private authService:AuthorizationService, private router:Router){}

  canActivate():boolean {

    if(!this.authService.isAuthenticated()){
      this.router.navigate(['/signin']);
      return false;
    }
    return true;
  }
}