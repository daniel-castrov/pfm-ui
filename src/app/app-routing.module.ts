import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SigninComponent } from './pfm-auth-module/signin/signin.component';
import { AuthGuard } from './pfm-auth-module/services/auth-guard';

const routes: Routes = [
  {path: '', component: SigninComponent},
  { path: 'budget', canActivate: [AuthGuard], loadChildren: () => import('./budget-feature/budget-feature.module').then(m => m.BudgetFeatureModule) },
  { path: 'planning', canActivate: [AuthGuard], loadChildren: () => import('./planning-feature/planning-feature.module').then(m => m.PlanningFeatureModule) },
  { path: 'programming', canActivate: [AuthGuard], loadChildren: () => import('./programming-feature/programming-feature.module').then(m => m.ProgrammingFeatureModule) },
  { path: 'home', canActivate: [AuthGuard], loadChildren: () => import('./pfm-home-module/pfm-home-module.module').then(m => m.PfmHomeModuleModule) }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
