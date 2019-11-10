import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { SignOutComponent } from './sign-out/sign-out.component';
import { ChooseCommunityComponent } from './choose-community/choose-community.component';
import { AuthGuard } from './services/auth-guard';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'signout', component: SignOutComponent, canActivate: [AuthGuard] },
      { path: 'signin', component: SigninComponent },
      { path: 'choose-community', component: ChooseCommunityComponent, canActivate: [AuthGuard] }
    ])
  ],
  exports: [RouterModule]
})
export class PfmAuthModuleRoutingModule { }
