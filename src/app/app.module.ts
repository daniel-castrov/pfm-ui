import { UfrUfrTabComponent } from './components/ufr/ufr-view/ufr-ufr-tab/ufr-ufr-tab.component';
import { CycleUtils } from './services/cycle.utils';
import { AllUfrsComponent } from './components/ufr/ufr-search/all-ufrs/all-ufrs.component';
import { TagsService } from './services/tags.service';
import { UserUtils } from './services/user.utils';
import { WithFullNameService } from './services/with-full-name.service';
import { NewProgrammaticRequestComponent } from './components/programming/select-program-request/new-programmatic-request/new-programmatic-request.component';
import { PomComponent } from './components/programming/select-program-request/pom/pom.component';
// app.modules
// ANGULAR IMPORTS
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { AgGridModule } from 'ag-grid-angular';
import 'ag-grid-enterprise';

// COMPONENTS
import { AboutComponent } from './components/about/about.component';
import { AboutPrivateComponent } from './components/about-private/about-private.component';
import { AccessChangeApprovalComponent } from './components/user-management/approval-role/role-approval.component';
import { ActualsTabComponent } from './components/execution/actuals-tab/actuals-tab.component';
import { AppComponent } from './app.component';
import { ApplyComponent } from './components/apply/apply.component';
import { AppropriationReleaseComponent } from './components/execution/appropriation-release/appropriation-release.component';
import { ApproveRequestsComponent } from './components/user-management/approve-requests/approve-requests.component';
import { NumericCellEditor } from './components/programming/create-pom-session/numeric-celleditior.component';
import { ChargesComponent } from './components/execution/charges/charges.component';
import { CommunityJoinComponent } from './components/user-management/approval-community/community-join.component';
import { CommunityLeaveComponent } from './components/user-management/approval-community/community-leave.component';
import { ContactComponent } from './components/contact/contact.component';
import { CreateExecutionPhaseComponent } from './components/execution/create-execution-phase/create-execution-phase.component';
import { CreatePomSessionComponent } from './components/programming/create-pom-session/create-pom-session.component';
import { ElevationComponent } from './components/user-management/manage-self/elevation/elevation.component';
import { ErrorDataService } from './components/error/errorData.service';
import { CurrentComponent } from './components/user-management/my-communities/current/current.component';
import { FilterComponent } from './components/filter/filter.component';
import { FundsTabComponent } from './components/programming/program-request/funds-tab/funds-tab.component';
import { FundsUpdateComponent } from './components/execution/funds-update/funds-update.component';
import { GraphsTabComponent } from './components/execution/graphs-tab/graphs-tab.component';
import { HeaderComponent } from './components/header/header.component';
import { HeaderStrangerComponent } from './components/header/header-stranger/header-stranger.component';
import { HeaderUserComponent } from './components/header/header-user/header-user.component';
import { HomeComponent } from './components/home/home.component';
import { JustificationTabComponent } from './components/programming/program-request/justification-tab/justification-tab.component';
import { LoginComponent } from './components/login/login.component';
import { ManageCommunitiesComponent } from './components/user-management/manage-communities/manage-communities.component';
import { MamageCommunityDetailsComponent } from './components/user-management/manage-communities/manage-community-details.component';
import { ManageRolesComponent } from './components/user-management/manage-roles/manage-roles.component';
import { ManageSelfComponent } from './components/user-management/manage-self/manage-self.component';
import { ManageUsersComponent } from './components/user-management/manage-users/manage-users.component';
import { MyCommunitiesComponent } from './components/user-management/my-communities/my-communities.component';
import { MyRolesComponent } from './components/user-management/my-roles/my-roles.component';
import { NoAccessComponent } from './components/error/no-access/no-access.component';
import { NoAccessInterceptor } from './components/interceptors/noAccessInterceptor.component';
import { NotFoundComponent } from './components/error/not-found/not-found.component';
import { NotImplementedComponent }  from './components/not-implmented/not-implemented.component';
import { OeUpdateComponent } from './components/execution/oe-update/oe-update.component';
import { PlanningComponent } from './components/planning/planning.component';
import { ProgramExecutionLineComponent } from './components/execution/program-execution-line/program-execution-line.component';
import { VariantsTabComponent } from './components/programming/program-request/variants-tab/variants-tab.component';
import { UfrVariantsTabComponent } from './components/ufr/ufr-view/ufr-variants-tab/ufr-variants-tab.component';
import { ProgramRequestComponent } from './components/programming/program-request/program-request.component';
import { ProgramTabComponent } from './components/programming/program-request/program-tab/program-tab.component';
import { RequestComponent } from './components/user-management/my-communities/request/request.component';
import { RestResultErrorComponent } from './components/error/restresult-error/restresult-error.component';
import { SelectProgramRequestComponent } from './components/programming/select-program-request/select-program-request.component';
import { SpendPlansTabComponent } from './components/execution/spend-plans-tab/spend-plans-tab.component';
import { SummaryTabComponent } from './components/programming/program-request/summary-tab/summary-tab.component';
import { UpdatePomSessionComponent } from './components/programming/update-pom-session/update-pom-session.component';
import { OpenPomSessionComponent } from './components/programming/open-pom-session/open-pom-session.component'
import { UserApprovalComponent } from './components/user-management/approval-newUser/user-approval.component';
import { UserListComponent } from './components/user-management/user-list/user-list.component';
import { UpdateProgramExecutionComponent } from './components/execution/update-program-execution/update-program-execution.component';
import { WithholdComponent } from './components/execution/withhold/withhold.component';
import { WorksheetManagementComponent } from './components/programming/pom-worksheet/worksheet-management/worksheet-management.component';

// GENERATED APIs AND MODELS
import { AssignRoleRequestService } from './generated/api/assignRoleRequest.service';
import { BASE_PATH } from './generated/variables';
import { BlankService } from './generated/api/blank.service';
import { CommunityService } from './generated/api/community.service';
import { CreateUserRequestService } from './generated/api/createUserRequest.service';
import { DropRoleRequestService } from './generated/api/dropRoleRequest.service';
import { FyPipe } from './pipes/fy.pipe';
import { JoinCommunityRequestService } from './generated/api/joinCommunityRequest.service';
import { LeaveCommunityRequestService } from './generated/api/leaveCommunityRequest.service';
import { MyDetailsService } from './generated/api/myDetails.service';
import { OrganizationService } from './generated/api/organization.service';
import { ProgramsService } from './generated/api/programs.service';
import { RequestsService } from './services/requests.service';
import { RoleService } from './generated/api/role.service';
import { RolesPermissionsService } from './generated/api/rolesPermissions.service';
import { StrangerService } from './generated/api/stranger.service';
import { UserRoleResourceService } from './generated/api/userRoleResource.service';
import { Injectables } from './services/injectables';
import { NoCurrentCommunityMessageComponent } from './components/user-management/my-communities/no-current-community-message/no-current-community-message.component';
import { ElevationService } from './services/elevation.component';
import { HeaderOpenComponent } from './components/header/header-open/header-open.component';
import { POMService } from './generated/api/pOM.service';
import { PRService } from './generated/api/pR.service';
import { PBService } from './generated/api/pB.service';
import { UFRsService } from './generated/api/uFRs.service';
import { ExecutionService } from './generated/api/execution.service';
import { ProgrammaticRequestsComponent } from './components/programming/select-program-request/programmatic-requests/programmatic-requests.component';
import { UfrSearchComponent } from './components/ufr/ufr-search/ufr-search.component';
import { UfrViewComponent } from './components/ufr/ufr-view/ufr-view.component';
import { UfrProgramComponent } from './components/ufr/ufr-view/ufr-program-tab/ufr-program-tab.component';
import { UfrFundsComponent } from './components/ufr/ufr-view/ufr-funds-tab/ufr-funds-tab.component';
import { UfrJustificationComponent } from './components/ufr/ufr-view/ufr-justification-tab/ufr-justification-tab.component';
import { ValuesPipe } from './pipes/values/values.pipe';
import { DashForZeroPipe } from './pipes/dash-for-zero.pipe';
import { NewUfrComponent } from './components/ufr/ufr-search/new-ufr/new-ufr.component';
import { OnlyDigitsDirective } from './directives/only-digits.directive';
import { RbacRoleDirective } from './directives/rbac.role.directive';
import { RbacPermissionDirective } from './directives/rbac.permission.directive';
import { MapAsListPipe } from './pipes/map-as-list.pipe';
import { ProgramRequestPageModeService } from './components/programming/program-request/page-mode.service';
import { SetEppComponent } from './components/programming/set-epp/set-epp.component';
import {
  EppService,
  LibraryService,
  UserService,
  OandEService,
  SpendPlanService,
  BudgetFundingLinesService,
  PrChangeNotificationsService
} from './generated';
import { AutoValuesService } from './components/programming/program-request/funds-tab/AutoValues.service';
import { ExecutionLineTableComponent } from './components/execution/execution-line-table/execution-line-table.component';
import { FileUploadComponent } from "./components/file-upload/file-upload.component";
import { LibraryComponent } from "./components/manage/library/library.component";
import { SimpleLinkCellRendererComponent } from './components/renderers/simple-link-cell-renderer/simple-link-cell-renderer.component';
import { ProgramCellRendererComponent } from './components/renderers/program-cell-renderer/program-cell-renderer.component';
import { IdAndNameComponent } from './components/programming/program-request/id-and-name/id-and-name.component';
import { LibraryViewCellRenderer} from "./components/renderers/library-view-cell-renderer/library-view-cell-renderer.component";
import { AgGridPaginationComponent } from "./components/ag-grid/ag-grid-pagination/ag-grid-pagination.component";
import { SummaryProgramCellRenderer } from "./components/renderers/event-column/summary-program-cell-renderer.component";
import { ExecutionLineDetailsComponent } from './components/execution/execution-line-details/execution-line-details.component';
import { EventDetailsCellRendererComponent } from './components/renderers/event-details-cell-renderer/event-details-cell-renderer.component';
import { TransferFromToDetailsCellRendererComponent } from './components/execution/transfer-from-to-details-cell-renderer/transfer-from-to-details-cell-renderer.component';
import { DeleteRenderer } from "./components/renderers/delete-renderer/delete-renderer.component";
import { ViewSiblingsRenderer } from "./components/renderers/view-siblings-renderer/view-siblings-renderer.component";
import { ToggleComponent } from './components/toggle/toggle.component';
import { ActualsCellRendererComponent } from './components/execution/actuals-cell-renderer/actuals-cell-renderer.component';
import {EmphasisAreasComponent} from "./components/ufr/ufr-view/ufr-program-tab/empasisAreas/emphasisAreas.component";
import {CheckboxRendererComponent} from "./components/programming/pom-worksheet/worksheet-management/checkbox-renderer.component";
import {DuplicateComponent} from "./components/programming/pom-worksheet/worksheet-management/duplicate/duplicate.component";
import {RenameComponent} from "./components/programming/pom-worksheet/worksheet-management/rename/rename.component";
import {ExportComponent} from "./components/programming/pom-worksheet/worksheet-management/export/export.component";
import {ImportComponent} from "./components/programming/pom-worksheet/worksheet-management/import/import.component";
import {NameUpdatingRendererComponent} from "./components/programming/pom-worksheet/worksheet-management/name-updating-renderer.component";
import {WorksheetService} from "./generated/api/worksheet.service";
import {StateService} from "./components/programming/pom-worksheet/worksheet-management/state.service";
import { BesRdteComponent } from './components/budget/bes-rdte/bes-rdte.component';
import { BesProcComponent } from './components/budget/bes-proc/bes-proc.component';
import {UfrApprovalSummaryComponent} from "./components/ufr/ufr-approval/ufr-approval-summary/ufr-approval-summary.component";
import { FyHeaderComponent } from './components/execution/fy-header/fy-header.component';
import {UfrApprovalDetailComponent} from "./components/ufr/ufr-approval/ufr-approval-detail/ufr-approval-detail.component";
import {UnlockComponent} from "./components/programming/pom-worksheet/worksheet-management/unlock/unlock.component";
import { OpenExecutionComponent } from './components/execution/open-execution/open-execution.component';
import {ViewEventsRenderer} from "./components/renderers/view-events-renderer/view-events-renderer.component";
import {ValueChangeRenderer} from "./components/renderers/value-change-renderer/value-change-renderer.component";
import {CheckboxCellRenderer} from "./components/renderers/anchor-checkbox-renderer/checkbox-cell-renderer.component";
import {GridToaComponent} from "./components/programming/update-pom-session/grid-toa/grid-toa.component";
import {ClosePomSessionComponent} from "./components/programming/close-pom-session/close-pom-session.component";
import {EventsModalComponent} from "./components/programming/update-pom-session/events-modal/events-modal.component";
import {WorksheetComponent} from "./components/programming/update-pom-session/worksheet/worksheet.component";
import {ReasonCodeComponent} from "./components/programming/update-pom-session/reason-code/reason-code.component";
import {BulkChangesComponent} from "./components/programming/update-pom-session/bulk-changes/bulk-changes.component";
import {FilterTextComponent} from "./components/programming/update-pom-session/filter-text/filter-text.component";
import {UpdateButtonComponent} from "./components/programming/update-pom-session/update-button/update-button.component";
import {LockButtonComponent} from "./components/programming/lock-pom-session/lock-button/lock-button.component";
import {WorksheetSelectorComponent} from "./components/programming/update-pom-session/worksheet-selector/worksheet-selector.component";
import {LockPomSessionComponent} from "./components/programming/lock-pom-session/lock-pom-session.component";
import {WorksheetViewingComponent} from "./components/programming/pom-worksheet/worksheet-viewing/worksheet-viewing.component";
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import {NameViewingRendererComponent} from "./components/programming/pom-worksheet/worksheet-viewing/name-viewing-renderer.component";
import {ViewPomSessionComponent} from "./components/programming/view-pom-session/view-pom-session.component";
import {WorksheetSelectedComponent} from "./components/programming/view-pom-session/worksheet-selected/worksheet-selected.component";


// ROUTES
const appRoutes: Routes = [
  {path:'', component:LoginComponent},
  {path:'about', component:AboutComponent},
  {path:'about-private', component:AboutPrivateComponent},
  {path:'apply', component:ApplyComponent},
  {path:'approve-requests', component:ApproveRequestsComponent},
  {path:'appropriation-release/:phaseId', component:AppropriationReleaseComponent},
  {path:'bes-rdte', component:BesRdteComponent},
  {path:'bes-proc', component:BesProcComponent},
  {path:'charges/:phaseId', component:ChargesComponent},
  {path:'exedetails/:lineId', component: ExecutionLineDetailsComponent },
  {path:'community-details/:id', component:MamageCommunityDetailsComponent},
  {path:'community-join/:requestId', component:CommunityJoinComponent},
  {path:'community-leave/:requestId', component:CommunityLeaveComponent},
  {path:'contact', component:ContactComponent},
  {path:'create-execution-phase', component:CreateExecutionPhaseComponent},
  {path:'create-new-pom', component: CreatePomSessionComponent},
  {path:'filter', component:FilterComponent},
  {path:'funds-update', component:FundsUpdateComponent},
  {path:'header', component:HeaderComponent},
  {path:'home', component:HomeComponent},
  {path:'manage-communities', component:ManageCommunitiesComponent},
  {path:'manage-users/:id', component:ManageUsersComponent},
  {path:'my-roles', component:MyRolesComponent},
  {path:'no-access', component:NoAccessComponent},
  {path:'not-found', component:NotFoundComponent},
  {path:'not-implemented', component:NotImplementedComponent},
  {path:'oe-update', component:OeUpdateComponent},
  {path:'open-execution', component: OpenExecutionComponent},
  {path:'planning', component:PlanningComponent},
  {path:'my-community', component:MyCommunitiesComponent},
  {path:'program-execution-line/:elid', component:ProgramExecutionLineComponent},
  {path:'program-request', component:ProgramRequestComponent},
  {path:'restresult-error', component:RestResultErrorComponent},
  {path:'roles', component:ManageRolesComponent},
  {path:'roles/:commid/:roleid/:userid', component:ManageRolesComponent},
  {path:'role-approve/:assignDrop/:requestId', component:AccessChangeApprovalComponent},
  {path:'set-epp', component: SetEppComponent},
  {path:'select-program-request', component:SelectProgramRequestComponent},
  {path:'spend-plan-update', component:SpendPlansTabComponent},
  {path:'user/:id', component:ManageSelfComponent},
  {path:'update-pom-session/:id', component:UpdatePomSessionComponent},
  {path:'update-pom-session', component:UpdatePomSessionComponent},
  {path:'lock-pom-session', component:LockPomSessionComponent},
  {path:'open-pom-session', component:OpenPomSessionComponent},
  {path:'view-pom-session/:id', component:ViewPomSessionComponent},
  {path:'close-pom-session', component:ClosePomSessionComponent},
  {path:'update-program-execution/:lineId', component:UpdateProgramExecutionComponent},
  {path:'user-approval/:requestId', component:UserApprovalComponent},
  {path:'user-list', component:UserListComponent},
  {path:'ufr-search', component: UfrSearchComponent},
  {path:'ufr-approval-summary', component: UfrApprovalSummaryComponent},
  {path:'ufr-approval-detail/:id', component: UfrApprovalDetailComponent},
  {path:'ufr-view/:id', component: UfrViewComponent},
  {path:'ufr-view/create/:ufr', component: UfrViewComponent},
  {path:'withhold/:phaseId', component: WithholdComponent},
  {path:'worksheet-management', component: WorksheetManagementComponent},
  {path:'worksheet-viewing', component: WorksheetViewingComponent},
  {path:'create-new-pom', component: CreatePomSessionComponent },
  {path:'library', component: LibraryComponent}
];

@NgModule({
  declarations: [
    AboutComponent,
    AboutPrivateComponent,
    AccessChangeApprovalComponent,
    ActualsTabComponent,
    AllUfrsComponent,
    AppComponent,
    ApplyComponent,
    AppropriationReleaseComponent,
    ApproveRequestsComponent,
    HeaderUserComponent,
    NumericCellEditor,
    ChargesComponent,
    CommunityJoinComponent,
    CommunityLeaveComponent,
    ContactComponent,
    CreateExecutionPhaseComponent,
    CreatePomSessionComponent,
    CurrentComponent,
    DashForZeroPipe,
    ElevationComponent,
    EmphasisAreasComponent,
    FilterComponent,
    FundsTabComponent,
    FundsUpdateComponent,
    FyPipe,
    GraphsTabComponent,
    HeaderComponent,
    HeaderOpenComponent,
    HeaderStrangerComponent,
    HeaderUserComponent,
    HomeComponent,
    IdAndNameComponent,
    JustificationTabComponent,
    LoginComponent,
    MamageCommunityDetailsComponent,
    ManageCommunitiesComponent,
    ManageRolesComponent,
    ManageSelfComponent,
    ManageSelfComponent,
    ManageUsersComponent,
    MapAsListPipe,
    MyCommunitiesComponent,
    MyRolesComponent,
    NewProgrammaticRequestComponent,
    NewUfrComponent,
    NoCurrentCommunityMessageComponent,
    NoAccessComponent,
    NotFoundComponent,
    NotImplementedComponent,
    OeUpdateComponent,
    OnlyDigitsDirective,
    PlanningComponent,
    PomComponent,
    VariantsTabComponent,
    UfrVariantsTabComponent,
    ProgramExecutionLineComponent,
    ProgramRequestComponent,
    ProgramTabComponent,
    ProgrammaticRequestsComponent,
    RequestComponent,
    RestResultErrorComponent,
    SelectProgramRequestComponent,
    SetEppComponent,
    SpendPlansTabComponent,
    SummaryTabComponent,
    UserApprovalComponent,
    UserListComponent,
    UfrSearchComponent,
    UfrApprovalSummaryComponent,
    UfrApprovalDetailComponent,
    UfrViewComponent,
    UfrProgramComponent,
    UfrFundsComponent,
    UfrUfrTabComponent,
    UfrJustificationComponent,
    UpdatePomSessionComponent,
    LockPomSessionComponent,
    OpenPomSessionComponent,
    ViewPomSessionComponent,
    ClosePomSessionComponent,
    UpdateProgramExecutionComponent,
    ValuesPipe,
    WithholdComponent,
    WorksheetManagementComponent,
    WorksheetViewingComponent,
    DashForZeroPipe,
    NewUfrComponent,
    OnlyDigitsDirective,
    RbacRoleDirective,
    RbacPermissionDirective,
    FyPipe,
    MapAsListPipe,
    ExecutionLineTableComponent,
    FileUploadComponent,
    CheckboxRendererComponent,
    CheckboxCellRenderer,
    NameUpdatingRendererComponent,
    NameViewingRendererComponent,
    SummaryProgramCellRenderer,
    AgGridPaginationComponent,
    LibraryComponent,
    SimpleLinkCellRendererComponent,
    ProgramCellRendererComponent,
    LibraryViewCellRenderer,
    DeleteRenderer,
    ViewSiblingsRenderer,
    ExecutionLineDetailsComponent,
    EventDetailsCellRendererComponent,
    TransferFromToDetailsCellRendererComponent,
    ToggleComponent,
    DuplicateComponent,
    RenameComponent,
    ExportComponent,
    ImportComponent,
    UnlockComponent,
    ActualsCellRendererComponent,
    BesRdteComponent,
    BesProcComponent,
    ViewEventsRenderer,
    ValueChangeRenderer,
    FyHeaderComponent,
    OpenExecutionComponent,
    GridToaComponent,
    EventsModalComponent,
    WorksheetComponent,
    ReasonCodeComponent,
    BulkChangesComponent,
    FilterTextComponent,
    UpdateButtonComponent,
    LockButtonComponent,
    WorksheetSelectorComponent,
    WorksheetSelectedComponent
    ConfirmationDialogComponent
  ],
  entryComponents: [
    SimpleLinkCellRendererComponent,
    ProgramCellRendererComponent,
    EventDetailsCellRendererComponent,
    SummaryProgramCellRenderer,
    LibraryViewCellRenderer,
    TransferFromToDetailsCellRendererComponent,
    DeleteRenderer,
    CheckboxRendererComponent,
    CheckboxCellRenderer,
    NameUpdatingRendererComponent,
    NameViewingRendererComponent,
    ViewSiblingsRenderer,
    ViewEventsRenderer,
    ValueChangeRenderer,
    ActualsCellRendererComponent,
    FyHeaderComponent,
    ConfirmationDialogComponent
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
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule.withComponents([NumericCellEditor])
  ],
  providers: [
    AssignRoleRequestService,
    BlankService,
    CommunityService,
    CreateUserRequestService,
    DropRoleRequestService,
    ElevationService,
    ErrorDataService,
    UserService,
    TagsService,
    Injectables,
    JoinCommunityRequestService,
    AutoValuesService,
    LeaveCommunityRequestService,
    MyDetailsService,
    OrganizationService,
    ProgramRequestPageModeService,
    RolesPermissionsService,
    WithFullNameService,
    RoleService,
    StrangerService,
    UserRoleResourceService,
    ProgramsService,
    UserUtils,
    CycleUtils,
    RequestsService,
    POMService,
    WorksheetService,
    PRService,
    PBService,
    UFRsService,
    EppService,
    ExecutionService,
    OandEService,
    LibraryService,
    StateService,
    SpendPlanService,
    BudgetFundingLinesService,
    PrChangeNotificationsService,
    { provide: BASE_PATH, useValue: environment.apiUrl },
    { provide: HTTP_INTERCEPTORS, useClass: NoAccessInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
