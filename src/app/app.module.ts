// app.modules
// ANGULAR IMPORTS
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// COMPONENTS
import { AboutComponent } from './components/about/about.component';
import { AboutPrivateComponent } from './components/about-private/about-private.component';
import { AccessChangeApprovalComponent } from './components/user-management/approval-role/access-change-approval.component';
import { AccessCommunityComponent } from './components/user-management/approval-community/access-community.component';
import { AppComponent } from './app.component';
import { ApplyComponent } from './components/apply/apply.component';
import { ContactComponent } from './components/contact/contact.component';
import { FilterComponent } from './components/filter/filter.component';
import { HeaderComponent } from './components/header/header.component';
import { HeaderNologinComponent } from './components/header-nologin/header-nologin.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ManageCommunitiesComponent } from './components/user-management/manage-communities/manage-communities.component';
import { MamageCommunityDetailsComponent } from './components/user-management/manage-communities/manage-community-details.component';
import { ManageRolesComponent } from './components/user-management/manage-roles/manage-roles.component';
import { ManageSelfComponent } from './components/user-management/manage-self/manage-self.component';
import { ManageUsersComponent } from './components/user-management/manage-users/manage-users.component';
import { NoAccessComponent } from './components/no-access/no-access.component';
import { NoAccessInterceptor } from './components/interceptors/noAccessInterceptor.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PlanningComponent } from './components/planning/planning.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { RequestAccessChangeComponent } from './components/user-management/manage-self/request-access-change.component';
import { RequestCommunityComponent } from './components/user-management/manage-self/request-community.component';
import { UserApprovalComponent } from './components/user-management/approval-newUser/user-approval.component';
import { UserListComponent } from './components/user-management/user-list/user-list.component';

// GENERATED APIs AND MODELS
import { AddUserToCommunityRequestService } from './generated/api/addUserToCommunityRequest.service';
import { BASE_PATH } from './generated/variables';
import { BlankService } from './generated/api/blank.service';
import { CommunityService } from './generated/api/community.service';
import { CreateUserRequestService } from './generated/api/createUserRequest.service';
import { MyDetailsService } from './generated/api/myDetails.service';
import { StrangerService } from './generated/api/stranger.service';
import { UserService } from './generated/api/user.service';
import { UserRoleService } from './generated/api/userRole.service';
import { RoleService } from './generated/api/role.service';

// ROUTES
const appRoutes: Routes = [
  {path:'', component:LoginComponent},
  {path:'about', component:AboutComponent},
  {path:'about-private', component:AboutPrivateComponent},
  {path:'access-change', component:RequestAccessChangeComponent},
  {path:'access-change-approval', component:AccessChangeApprovalComponent},
  {path:'access-community/:id', component:AccessCommunityComponent},
  {path:'apply', component:ApplyComponent},
  {path:'community-details/:id', component:MamageCommunityDetailsComponent},
  {path:'contact', component:ContactComponent},
  {path:'filter', component:FilterComponent},
  {path:'header', component:HeaderComponent},
  {path:'header-nologin', component:HeaderNologinComponent},
  {path:'home', component:HomeComponent},
  {path:'manage-communities', component:ManageCommunitiesComponent},
  {path:'manage-users/:id', component:ManageUsersComponent},
  {path:'no-access', component:NoAccessComponent},
  {path:'not-found', component:NotFoundComponent},
  {path:'planning', component:PlanningComponent},
  {path:'programs', component:ProgramsComponent},
  {path:'request-access-change', component:RequestAccessChangeComponent},
  {path:'request-community', component:RequestCommunityComponent},
  {path:'roles', component:ManageRolesComponent},
  {path:'user/:id', component:ManageSelfComponent},
  {path:'user-approval/:id', component:UserApprovalComponent},
  {path:'user-list', component:UserListComponent},

];

@NgModule({
  declarations: [
    AboutComponent,
    AboutPrivateComponent,
    AccessChangeApprovalComponent,
    AppComponent,
    ApplyComponent,
    AccessCommunityComponent,
    ContactComponent,
    FilterComponent,
    HeaderComponent,
    HeaderNologinComponent,
    HomeComponent,
    LoginComponent,
    MamageCommunityDetailsComponent,
    ManageCommunitiesComponent,
    ManageRolesComponent,
    ManageSelfComponent,
    ManageSelfComponent,
    ManageUsersComponent,
    NoAccessComponent,
    NotFoundComponent,
    PlanningComponent,
    ProgramsComponent,
    RequestAccessChangeComponent,
    RequestCommunityComponent,
    UserApprovalComponent,
    UserListComponent
  ],

  imports: [
    AccordionModule.forRoot(),
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(appRoutes),
  ],
  providers: [
    AddUserToCommunityRequestService,
    BlankService,
    CommunityService,
    CreateUserRequestService,
    MyDetailsService,
    RoleService,
    StrangerService,
    UserRoleService,
    UserService,
    { provide: BASE_PATH, useValue: 'https://ec2-54-174-141-253.compute-1.amazonaws.com:8445/jscbis' },
    //{ provide: BASE_PATH, useValue: 'https://localhost:8445/jscbis' },
    { provide: HTTP_INTERCEPTORS, useClass: NoAccessInterceptor, multi: true, },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
