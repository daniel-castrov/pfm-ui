import { NewProgrammaticRequestComponent } from './components/programming/select-program-request/new-programmatic-request/new-programmatic-request.component';
import { PomComponent } from './components/programming/select-program-request/pom/pom.component';
// app.modules
// ANGULAR IMPORTS
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule, MatPaginatorModule, MatProgressSpinnerModule,
         MatSortModule, MatTableModule } from "@angular/material";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { environment } from '../environments/environment'

// COMPONENTS
import { AboutComponent } from './components/about/about.component';
import { AboutPrivateComponent } from './components/about-private/about-private.component';
import { AccessChangeApprovalComponent } from './components/user-management/approval-role/access-change-approval.component';
import { AppComponent } from './app.component';
import { ApplyComponent } from './components/apply/apply.component';
import { ApproveRequestsComponent } from './components/user-management/approve-requests/approve-requests.component';
import { CreatePomSessionComponent } from './components/programming/create-pom-session/create-pom-session.component';
import { CommunityJoinComponent } from './components/user-management/approval-community/community-join.component';
import { CommunityLeaveComponent } from './components/user-management/approval-community/community-leave.component';
import { ContactComponent } from './components/contact/contact.component';
import { ElevationComponent } from './components/user-management/manage-self/elevation/elevation.component';
import { CurrentComponent } from './components/user-management/my-communities/current/current.component';
import { FilterComponent } from './components/filter/filter.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { FundsComponent } from './components/programs/program-view/funds.component';
import { FundsTabComponent } from './components/programming/existing-program-request/funds-tab/funds-tab.component';
import { HeaderComponent } from './components/header/header.component';
import { HeaderStrangerComponent } from './components/header/header-stranger/header-stranger.component';
import { HeaderUserComponent } from './components/header/header-user/header-user.component';
import { HomeComponent } from './components/home/home.component';
import { JustificationTabComponent } from './components/programming/existing-program-request/justification-tab/justification-tab.component';
import { LoginComponent } from './components/login/login.component';
import { ManageCommunitiesComponent } from './components/user-management/manage-communities/manage-communities.component';
import { MamageCommunityDetailsComponent } from './components/user-management/manage-communities/manage-community-details.component';
import { ManageRolesComponent } from './components/user-management/manage-roles/manage-roles.component';
import { ManageSelfComponent } from './components/user-management/manage-self/manage-self.component';
import { ManageUsersComponent } from './components/user-management/manage-users/manage-users.component';
import { MyCommunitiesComponent } from './components/user-management/my-communities/my-communities.component';
import { NoAccessComponent } from './components/no-access/no-access.component';
import { NoAccessInterceptor } from './components/interceptors/noAccessInterceptor.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { NotImplementedComponent }  from './components/not-implmented/not-implemented.component';
import { PlanningComponent } from './components/planning/planning.component';
import { ProcQtyTabComponent } from './components/programming/existing-program-request/proc-qty-tab/proc-qty-tab.component';
import { ProgramComponent } from './components/programs/program-view/program.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { ProgramExportComponent } from './components/programs/program-export/program-export.component';
import { ProgramRequestComponent } from './components/programming/existing-program-request/existing-program-request.component';
import { ProgramSearchComponent } from './components/programs/program-search/program-search.component';
import { ProgramTabComponent } from './components/programming/existing-program-request/program-tab/program-tab.component';
import { ProgramViewComponent } from './components/programs/program-view/program-view.component';
import { RequestAccessChangeComponent } from './components/user-management/manage-self/request-access-change.component';
import { RequestComponent } from './components/user-management/my-communities/request/request.component';
import { SelectProgramRequestComponent } from './components/programming/select-program-request/select-program-request.component';
import { SummaryTabComponent } from './components/programming/existing-program-request/summary-tab/summary-tab.component';
import { UpdatePomSessionComponent } from './components/programming/update-pom-session/update-pom-session.component';
import { UserApprovalComponent } from './components/user-management/approval-newUser/user-approval.component';
import { UserListComponent } from './components/user-management/user-list/user-list.component';
import { VariantsComponent } from './components/programs/program-view/variants.component';
import { WorksheetManagementComponent } from './components/programming/worksheet-management/worksheet-management.component';

// GENERATED APIs AND MODELS
import { BASE_PATH } from './generated/variables';
import { BlankService } from './generated/api/blank.service';
import { BulkTabComponent } from './components/programming/update-pom-session/bulk-tab/bulk-tab.component';
import { CalculateTabComponent } from './components/programming/update-pom-session/calculate-tab/calculate-tab.component';
import { CommunityService } from './generated/api/community.service';
import { CreateUserRequestService } from './generated/api/createUserRequest.service';
import { FyPipe } from './pipes/fy.pipe';
import { JoinCommunityRequestService } from './generated/api/joinCommunityRequest.service';
import { LeaveCommunityRequestService } from './generated/api/leaveCommunityRequest.service';
import { MyDetailsService } from './generated/api/myDetails.service';
import { OrganizationService } from './generated/api/organization.service';
import { ProgramsService } from './generated/api/programs.service';
import { RequestsService } from './services/requests.service';
import { RoleService } from './generated/api/role.service';
import { StrangerService } from './generated/api/stranger.service';
import { UserService } from './generated/api/user.service';
import { UserRoleResourceService } from './generated/api/userRoleResource.service';
import { VariantLineComponent } from './components/programs/program-view/variant-line/variant-line.component';
import { Injectables } from './services/injectables';
import { NoCurrentCommunityMessageComponent } from './components/user-management/my-communities/no-current-community-message/no-current-community-message.component';
import { ElevationService } from './services/elevation.component';
import { HeaderOpenComponent } from './components/header/header-open/header-open.component';
import { POMService } from './generated/api/pOM.service';
import { PRService } from './generated/api/pR.service';
import { PBService } from './generated/api/pB.service';
import { UFRsService } from './generated/api/uFRs.service';
import { ProgrammaticRequestsComponent } from './components/programming/select-program-request/programmatic-requests/programmatic-requests.component';
import { TransferTabComponent } from './components/programming/update-pom-session/transfer-tab/transfer-tab.component';
import { UfrSearchComponent } from './components/ufr/ufr-search/ufr-search.component';
import { UfrViewComponent } from './components/ufr/ufr-view/ufr-view.component';
import { UfrMetadataComponent } from './components/ufr/metadata/ufr-metadata.component';
import { UfrFundsComponent } from './components/ufr/ufr-funds/ufr-funds.component';
import { UfrVariantsComponent } from './components/ufr/ufr-variants/ufr-variants.component';
import { UfrTabComponent } from './components/ufr/ufr-tab/ufr-tab.component';
import { UfrJustificationComponent } from './components/ufr/ufr-justification/ufr-justification.component';
import { ValuesPipe } from './pipes/values/values.pipe';
import { DashForZeroPipe } from './pipes/dash-for-zero.pipe';
import { NewUfrComponent } from './components/ufr/new-ufr/new-ufr.component';
import { OnlyDigitsDirective } from './directives/only-digits.directive';
import { MapAsListPipe } from './pipes/map-as-list.pipe';

// ROUTES
const appRoutes: Routes = [
  {path:'', component:LoginComponent},
  {path:'about', component:AboutComponent},
  {path:'about-private', component:AboutPrivateComponent},
  {path:'access-change', component:RequestAccessChangeComponent},
  {path:'access-change-approval', component:AccessChangeApprovalComponent},
  {path:'apply', component:ApplyComponent},
  {path:'approve-requests', component:ApproveRequestsComponent},
  {path:'community-details/:id', component:MamageCommunityDetailsComponent},
  {path:'community-join/:requestId', component:CommunityJoinComponent},
  {path:'community-leave/:requestId', component:CommunityLeaveComponent},
  {path:'contact', component:ContactComponent},
  {path:'existing-program-request/:prId', component:ProgramRequestComponent},
  {path:'filter', component:FilterComponent},
  {path:'header', component:HeaderComponent},
  {path:'home', component:HomeComponent},
  {path:'manage-communities', component:ManageCommunitiesComponent},
  {path:'manage-users/:id', component:ManageUsersComponent},
  {path:'no-access', component:NoAccessComponent},
  {path:'not-found', component:NotFoundComponent},
  {path:'not-implemented', component:NotImplementedComponent},
  {path:'planning', component:PlanningComponent},
  {path:'programs', component:ProgramsComponent},
  {path:'program-search', component:ProgramSearchComponent},
  {path:'program-view/:id', component:ProgramViewComponent},
  {path:'request-access-change', component:RequestAccessChangeComponent},
  {path:'my-community', component:MyCommunitiesComponent},
  {path:'roles', component:ManageRolesComponent},
  {path:'roles/:commid/:roleid/:userid', component:ManageRolesComponent},
  {path:'select-program-request', component:SelectProgramRequestComponent},
  {path:'user/:id', component:ManageSelfComponent},
  {path:'update-pom-session', component:UpdatePomSessionComponent},
  {path:'user-approval/:requestId', component:UserApprovalComponent},
  {path:'user-list', component:UserListComponent},
  { path: 'exporter', component: ProgramExportComponent },
  { path: 'create-new-pom', component: CreatePomSessionComponent },
  { path: 'ufr-search', component: UfrSearchComponent },
  { path: 'ufr-view/:id', component: UfrViewComponent },
  { path: 'worksheet-management', component: WorksheetManagementComponent }

];

@NgModule({
  declarations: [
    AboutComponent,
    AboutPrivateComponent,
    AccessChangeApprovalComponent,
    AppComponent,
    ApplyComponent,
    ApproveRequestsComponent,
    BulkTabComponent,
    HeaderUserComponent,
    CalculateTabComponent,
    CommunityJoinComponent,
    CommunityLeaveComponent,
    ContactComponent,
    CreatePomSessionComponent,
    CurrentComponent,
    ElevationComponent,
    FeedbackComponent,
    FilterComponent,
    FundsComponent,
    FundsTabComponent,
    FyPipe,
    HeaderComponent,
    HeaderOpenComponent,
    HeaderStrangerComponent,
    HeaderUserComponent,
    HomeComponent,
    JustificationTabComponent,
    LoginComponent,
    MamageCommunityDetailsComponent,
    ManageCommunitiesComponent,
    ManageRolesComponent,
    ManageSelfComponent,
    ManageSelfComponent,
    ManageUsersComponent,
    MyCommunitiesComponent,
    NewProgrammaticRequestComponent,
    NoCurrentCommunityMessageComponent,
    NoAccessComponent,
    NotFoundComponent,
    NotImplementedComponent,
    PlanningComponent,
    PomComponent,
    ProcQtyTabComponent,
    ProgramComponent,
    ProgramExportComponent,
    ProgramRequestComponent,
    ProgramSearchComponent,
    ProgramTabComponent,
    ProgramViewComponent,
    ProgramsComponent,
    ProgrammaticRequestsComponent,
    RequestAccessChangeComponent,
    RequestComponent,
    SelectProgramRequestComponent,
    SummaryTabComponent,
    UserApprovalComponent,
    UserListComponent,
    VariantsComponent,
    VariantLineComponent,
    TransferTabComponent,
    UfrSearchComponent,
    UfrViewComponent,
    UfrMetadataComponent,
    UfrFundsComponent,
    UfrVariantsComponent,
    UfrTabComponent,
    UfrJustificationComponent,
    UpdatePomSessionComponent,
    ValuesPipe,
    WorksheetManagementComponent,
    DashForZeroPipe,
    NewUfrComponent,
    OnlyDigitsDirective,
    FyPipe,
    MapAsListPipe
  ],

  imports: [
    AccordionModule.forRoot(),
    AngularDualListBoxModule,
    BrowserModule,
    FormsModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(appRoutes),
    TabsModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [
    BlankService,
    CommunityService,
    CreateUserRequestService,
    ElevationService,
    Injectables,
    JoinCommunityRequestService,
    LeaveCommunityRequestService,
    MyDetailsService,
    OrganizationService,
    RoleService,
    StrangerService,
    UserRoleResourceService,
    ProgramsService,
    UserService,
    RequestsService,
    POMService,
    PRService,
    PBService,
    UFRsService,
    { provide: BASE_PATH, useValue: environment.apiUrl },
    { provide: HTTP_INTERCEPTORS, useClass: NoAccessInterceptor, multi: true, },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
