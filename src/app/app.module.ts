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
import { AccessChangeComponent } from './components/access-change/access-change.component';
import { AppComponent } from './app.component';
import { ApplyComponent } from './components/apply/apply.component';
import { ContactComponent } from './components/contact/contact.component';
import { CommunityDetailsComponent } from './components/community-details/community-details.component';
import { CreateCommunityComponent } from './components/create-community/create-community.component';
import { FilterComponent } from './components/filter/filter.component';
import { HeaderComponent } from './components/header/header.component';
import { HeaderNologinComponent } from './components/header-nologin/header-nologin.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';
import { NoAccessComponent } from './components/no-access/no-access.component';
import { NoAccessInterceptor } from './components/interceptors/noAccessInterceptor.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PlanningComponent } from './components/planning/planning.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { RolesComponent } from './components/roles/roles.component';
import { SuspendDeleteComponent } from './components/suspend-delete/suspend-delete.component';
import { UserComponent } from './components/user/user.component';
import { UserListComponent } from './components/user-list/user-list.component';



// GENERATED APIs AND MODELS
import { BASE_PATH } from './generated/variables';
import { BlankService } from './generated/api/blank.service';
import { CommunityService } from './generated/api/community.service';
import { FundLineService } from './generated/api/fundLine.service';
import { ProgramService } from './generated/api/program.service';
import { TagService } from './generated/api/tag.service';
import { MyDetailsService } from './generated/api/myDetails.service';
import { UserApprovalComponent } from './components/user-approval/user-approval.component';
import { UserService } from './generated/api/user.service';
import { RoleService } from './generated/api/role.service';

// ROUTES
const appRoutes: Routes = [
  {path:'', component:LoginComponent},
  {path:'about', component:AboutComponent},
  {path:'about-private', component:AboutPrivateComponent},
  {path:'access-change', component:AccessChangeComponent},
  {path:'apply', component:ApplyComponent},
  {path:'community-details', component:CommunityDetailsComponent},
  {path:'create-community', component:CreateCommunityComponent},
  {path:'contact', component:ContactComponent},
  {path:'filter', component:FilterComponent},
  {path:'header', component:HeaderComponent},
  {path:'header-nologin', component:HeaderNologinComponent},
  {path:'home', component:HomeComponent},
  {path:'manage-users/:id', component:ManageUsersComponent},
  {path:'no-access', component:NoAccessComponent},
  {path:'not-found', component:NotFoundComponent},
  {path:'planning', component:PlanningComponent},
  {path:'programs', component:ProgramsComponent},
  {path:'roles', component:RolesComponent},
  {path:'suspend-delete', component:SuspendDeleteComponent},
  {path:'user/:id', component:UserComponent},
  {path:'user-approval', component:UserApprovalComponent},
  {path:'user-list', component:UserListComponent},

];

@NgModule({
  declarations: [
    AboutComponent,
    AboutPrivateComponent,
    AccessChangeComponent,
    AppComponent,
    ApplyComponent,
    ContactComponent,
    CommunityDetailsComponent,
    CreateCommunityComponent,
    FilterComponent,
    HeaderComponent,
    HeaderNologinComponent,
    HomeComponent,
    LoginComponent,
    ManageUsersComponent,
    NoAccessComponent,
    NotFoundComponent,
    PlanningComponent,
    ProgramsComponent,
    RolesComponent,
    SuspendDeleteComponent,
    UserApprovalComponent,
    UserComponent,
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
    BlankService,
    CommunityService,
    FundLineService,
    ProgramService,
    TagService,
    MyDetailsService,
    RoleService,
    UserService,
    //{ provide: BASE_PATH, useValue: 'https://ec2-34-231-125-182.compute-1.amazonaws.com:8443/jscbis' },
    { provide: BASE_PATH, useValue: 'https://localhost:8445/jscbis' },
    { provide: HTTP_INTERCEPTORS, useClass: NoAccessInterceptor, multi: true, },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
