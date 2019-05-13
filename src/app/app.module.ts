import { UfrUfrTabComponent } from './components/ufr/ufr-view/ufr-ufr-tab/ufr-ufr-tab.component';
import { AllUfrsComponent } from './components/ufr/ufr-search/all-ufrs/all-ufrs.component';
import { NewProgramComponent } from './components/programming/select-program-request/new-program-request/new-program-request.component';
import { PomComponent } from './components/programming/select-program-request/pom/pom.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatInputModule, MatPaginatorModule, MatProgressSpinnerModule, MatSortModule, MatTableModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbDateParserFormatter, NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { environment } from '../environments/environment';
import { AgGridModule } from 'ag-grid-angular';
import 'ag-grid-enterprise';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';

import { AboutComponent } from './components/about/about.component';
import { AboutPrivateComponent } from './components/about-private/about-private.component';
import { AccessChangeApprovalComponent } from './components/user-management/approval-role/role-approval.component';
import { ActualsTabComponent } from './components/execution/actuals-tab/actuals-tab.component';
import { AppComponent } from './app.component';
import { ApplyComponent } from './components/apply/apply.component';
import { AppropriationReleaseComponent } from './components/execution/appropriation-release/appropriation-release.component';
import { ApproveRequestsComponent } from './components/user-management/approve-requests/approve-requests.component';
import { ChargesComponent } from './components/execution/charges/charges.component';
import { CommunityJoinComponent } from './components/user-management/approval-community/community-join.component';
import { CommunityLeaveComponent } from './components/user-management/approval-community/community-leave.component';
import { ContactComponent } from './components/contact/contact.component';
import { CreateExecutionPhaseComponent } from './components/execution/create-execution-phase/create-execution-phase.component';
import { CreatePomSessionComponent } from './components/programming/create-pom-session/create-pom-session.component';
import { ElevationComponent } from './components/user-management/manage-self/elevation/elevation.component';
import { CurrentComponent } from './components/user-management/my-communities/current/current.component';
import { FilterComponent } from './components/filter/filter.component';
import { FundsTabComponent } from './components/programming/program-request/funds-tab/funds-tab.component';
import { FundsUpdateComponent } from './components/execution/funds-update/funds-update.component';
import { GraphsTabComponent } from './components/execution/graphs-tab/graphs-tab.component';
import { JHeaderComponent } from './components/header/j-header/j-header.component';
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
import { ErrorHandlingInterceptor } from './components/interceptors/error-handling-interceptor.component';
import { NotFoundComponent } from './components/error/not-found/not-found.component';
import { NotImplementedComponent } from './components/not-implmented/not-implemented.component';
import { OeUpdateComponent } from './components/execution/oe-update/oe-update.component';
import { PlanningComponent } from './components/planning/planning.component';
import { ProgramExecutionLineComponent } from './components/execution/program-execution-line/program-execution-line.component';
import { VariantsTabComponent } from './components/programming/program-request/variants-tab/variants-tab.component';
import { UfrVariantsTabComponent } from './components/ufr/ufr-view/ufr-variants-tab/ufr-variants-tab.component';
import { PFormsComponent } from './components/budget/p-forms/p-forms.component';
import { P40Component } from './components/budget/p-forms/p40/p40.component';
import { P5Component } from './components/budget/p-forms/p5/p5.component';
import { P5aComponent } from './components/budget/p-forms/p5a/p5a.component';
import { P21Component } from './components/budget/p-forms/p21/p21.component';
import { RFormsComponent } from './components/budget/r-forms/r-forms.component';
import { R2Component } from './components/budget/r-forms/r2/r2.component';
import { R2AComponent } from './components/budget/r-forms/r2-a/r2-a.component';
import { R3Component } from './components/budget/r-forms/r3/r3.component';
import { R4Component } from './components/budget/r-forms/r4/r4.component';
import { R4AComponent } from './components/budget/r-forms/r4-a/r4-a.component';
import { ProgramRequestComponent } from './components/programming/program-request/program-request.component';
import { ProgramTabComponent } from './components/programming/program-request/program-tab/program-tab.component';
import { RequestComponent } from './components/user-management/my-communities/request/request.component';
import { RestResultErrorComponent } from './components/error/restresult-error/restresult-error.component';
import { SelectProgramRequestComponent } from './components/programming/select-program-request/select-program-request.component';
import { SpendPlansTabComponent } from './components/execution/spend-plans-tab/spend-plans-tab.component';
import { UpdatePomSessionComponent } from './components/programming/update-pom-session/update-pom-session.component';
import { OpenPomSessionComponent } from './components/programming/open-pom-session/open-pom-session.component';
import { UserApprovalComponent } from './components/user-management/approval-newUser/user-approval.component';
import { UserListComponent } from './components/user-management/user-list/user-list.component';
import { UpdateProgramExecutionComponent } from './components/execution/update-program-execution/update-program-execution.component';
import { WithholdComponent } from './components/execution/withhold/withhold.component';
import { WorksheetManagementComponent } from './components/programming/pom-worksheet/worksheet-management/worksheet-management.component';
import { BASE_PATH } from './generated/variables';
import { FyPipe } from './pipes/fy.pipe';
import { NoCurrentCommunityMessageComponent } from './components/user-management/my-communities/no-current-community-message/no-current-community-message.component';
import { HeaderOpenComponent } from './components/header/header-open/header-open.component';
import { ProgramsComponent } from './components/programming/select-program-request/program-requests/program-requests.component';
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
import { SetEppComponent } from './components/programming/set-epp/set-epp.component';
import { ExecutionLineTableComponent } from './components/execution/execution-line-table/execution-line-table.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { LibraryComponent } from './components/manage/library/library.component';
import { SimpleLinkCellRendererComponent } from './components/renderers/simple-link-cell-renderer/simple-link-cell-renderer.component';
import { ProgramCellRendererComponent } from './components/renderers/program-cell-renderer/program-cell-renderer.component';
import { IdAndNameComponent } from './components/programming/program-request/id-and-name/id-and-name.component';
import { LibraryViewCellRenderer } from './components/renderers/library-view-cell-renderer/library-view-cell-renderer.component';
import { AgGridPaginationComponent } from './components/ag-grid/ag-grid-pagination/ag-grid-pagination.component';
import { SummaryProgramCellRenderer } from './components/renderers/event-column/summary-program-cell-renderer.component';
import { ExecutionLineDetailsComponent } from './components/execution/execution-line-details/execution-line-details.component';
import { EventDetailsCellRendererComponent } from './components/renderers/event-details-cell-renderer/event-details-cell-renderer.component';
import { TransferFromToDetailsCellRendererComponent } from './components/execution/transfer-from-to-details-cell-renderer/transfer-from-to-details-cell-renderer.component';
import { DeleteRenderer } from './components/renderers/delete-renderer/delete-renderer.component';
import { ViewSiblingsRenderer } from './components/renderers/view-siblings-renderer/view-siblings-renderer.component';
import { ToggleComponent } from './components/toggle/toggle.component';
import { ActualsCellRendererComponent } from './components/execution/actuals-cell-renderer/actuals-cell-renderer.component';
import { EmphasisAreasComponent } from './components/ufr/ufr-view/ufr-program-tab/empasisAreas/emphasisAreas.component';
import { CheckboxRendererComponent } from './components/programming/pom-worksheet/worksheet-management/checkbox-renderer.component';
import { DuplicateComponent } from './components/programming/pom-worksheet/worksheet-management/duplicate/duplicate.component';
import { RenameComponent } from './components/programming/pom-worksheet/worksheet-management/rename/rename.component';
import { ExportComponent } from './components/programming/pom-worksheet/worksheet-management/export/export.component';
import { ImportComponent } from './components/programming/pom-worksheet/worksheet-management/import/import.component';
import { NameUpdatingRendererComponent } from './components/programming/pom-worksheet/worksheet-management/name-updating-renderer.component';
import { BesRdteComponent } from './components/budget/bes-rdte/bes-rdte.component';
import { BesProcComponent } from './components/budget/bes-proc/bes-proc.component';
import { UfrApprovalSummaryComponent } from './components/ufr/ufr-approval/ufr-approval-summary/ufr-approval-summary.component';
import { FyHeaderComponent } from './components/execution/fy-header/fy-header.component';
import { UfrApprovalDetailComponent } from './components/ufr/ufr-approval/ufr-approval-detail/ufr-approval-detail.component';
import { UnlockComponent } from './components/programming/pom-worksheet/worksheet-management/unlock/unlock.component';
import { OpenExecutionComponent } from './components/execution/open-execution/open-execution.component';
import { ViewEventsRenderer } from './components/renderers/view-events-renderer/view-events-renderer.component';
import { ValueChangeRenderer } from './components/renderers/value-change-renderer/value-change-renderer.component';
import { CheckboxCellRenderer } from './components/renderers/anchor-checkbox-renderer/checkbox-cell-renderer.component';
import { GridToaComponent } from './components/programming/update-pom-session/grid-toa/grid-toa.component';
import { ClosePomSessionComponent } from './components/programming/close-pom-session/close-pom-session.component';
import { EventsModalComponent } from './components/programming/update-pom-session/events-modal/events-modal.component';
import { WorksheetComponent } from './components/programming/update-pom-session/worksheet/worksheet.component';
import { ReasonCodeComponent } from './components/programming/update-pom-session/reason-code/reason-code.component';
import { BulkChangesComponent } from './components/programming/update-pom-session/bulk-changes/bulk-changes.component';
import { FilterTextComponent } from './components/programming/update-pom-session/filter-text/filter-text.component';
import { UpdateButtonComponent } from './components/programming/update-pom-session/update-button/update-button.component';
import { LockButtonComponent } from './components/programming/lock-pom-session/lock-button/lock-button.component';
import { WorksheetSelectorComponent } from './components/programming/update-pom-session/worksheet-selector/worksheet-selector.component';
import { LockPomSessionComponent } from './components/programming/lock-pom-session/lock-pom-session.component';
import { WorksheetViewingComponent } from './components/programming/pom-worksheet/worksheet-viewing/worksheet-viewing.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { NameViewingRendererComponent } from './components/programming/pom-worksheet/worksheet-viewing/name-viewing-renderer.component';
import { ViewPomSessionComponent } from './components/programming/view-pom-session/view-pom-session.component';
import { WorksheetSelectedComponent } from './components/programming/view-pom-session/worksheet-selected/worksheet-selected.component';
import { GridRowsComponent } from './components/ag-grid/grid-rows/grid-rows.component';
import { LockedWorksheetsComponent } from './components/programming/lock-pom-session/locked-worksheets/locked-worksheets.component';
import { MenuBarComponent } from './components/menu-bar/menu-bar.component';
import { PlanningMenuComponent } from './components/menu-bar/planning-menu/planning-menu.component';
import { ProgrammingMenuComponent } from './components/menu-bar/programming-menu/programming-menu.component';
import { BudgetMenuComponent } from './components/menu-bar/budget-menu/budget-menu.component';
import { ExecutionMenuComponent } from './components/menu-bar/execution-menu/execution-menu.component';
import { ReportsMenuComponent } from './components/menu-bar/reports-menu/reports-menu.component';
import { ManageMenuComponent } from './components/menu-bar/manage-menu/manage-menu.component';
import { AdminMenuComponent } from './components/menu-bar/admin-menu/admin-menu.component';
import { UserActionsComponent } from './components/menu-bar/user-actions/user-actions.component';
import { PrChangeNotificationsComponent } from './components/menu-bar/pr-change-notofications/pr-change-notifications.component';
import { CanActivateAuth } from './utils/can.activate';
import { MenuRolesOkDirective } from './directives/menu.roles.ok.directive';
import { MenuRolesNotNowDirective } from './directives/menu.roles.notnow.directive';
import { CreateBudgetComponent } from './components/budget/create-budget/create-budget.component';
import { UfrYoeSummaryComponent } from './components/ufr/ufr-yoe/ufr-yoe-summary.component';
import { CopyBudgetComponent } from './components/budget/copy-budget/copy-budget.component';
import { EditBudgetDetailsComponent } from './components/budget/edit-budget-details/edit-budget-details.component';
import { TitleTabComponent } from './components/budget/edit-budget-details/title-tab/title-tab.component';
import { OverviewTabComponent } from './components/budget/edit-budget-details/overview-tab/overview-tab.component';
import { R1TabComponent } from './components/budget/edit-budget-details/r1-tab/r1-tab.component';
import { ScenarioSelectorComponent } from './components/budget/edit-budget-details/scenario-selector/scenario-selector.component';
import { ServerErrorComponent } from './components/error/server-error/server-error.component';
import { R2TabComponent } from './components/budget/edit-budget-details/r2-tab/r2-tab.component';
import { R2aTabComponentOnBudgetDetails } from './components/budget/edit-budget-details/r2a-tab/r2a-tab-component-on-budget-details.component';
import { ImportActualsComponent } from './components/execution/import-actuals/import-actuals.component';
import { AppHeaderComponent } from './components/header/app-header/app-header.component';
import { ImportActualsTableComponent } from './components/execution/import-actuals-table/import-actuals-table.component';
import { LockPositionComponent } from './components/budget/lock-position/lock-position.component';
import { DatepickerModule } from 'ngx-bootstrap';
import { CustomNgbDateParserFormatter } from './utils/CustomNgbParserFormatter';
import { FormPipe } from './pipes/form.pipe';
import { EditProgramDetailsComponent } from './components/budget/edit-program-details/edit-program-details.component';
import { R2aTabComponentOnProgramDetails } from './components/budget/edit-program-details/r2a-tab/r2a-tab-component-on-program-details.component';
import { ProgramAndItemSelectorComponent } from './components/budget/edit-program-details/program-selector/program-and-item-selector.component';
import { SectionBComponent } from './components/budget/edit-program-details/r2a-tab/section-b/section-b.component';
import { RoleBuilderComponent } from './components/user-management/role-builder/role-builder.component';
import { SectionAComponent } from './components/budget/edit-program-details/r2a-tab/section-a/section-a.component';
import { SectionDComponent } from './components/budget/edit-program-details/r2a-tab/section-d/section-d.component';
import { SectionEComponent } from './components/budget/edit-program-details/r2a-tab/section-e/section-e.component';
import { R3TabComponent } from './components/budget/edit-program-details/r3-tab/r3-tab.component';
import { R3EntriesComponent } from './components/budget/edit-program-details/r3-tab/r3-entries/r3-entries.component';
import { CreateMrdbProgramComponent } from './components/manage/execution/create-mrdb-program/create-mrdb-program.component';
import { R4aTabComponent } from './components/budget/edit-program-details/r4a-tab/r4a-tab.component';
import { R3SummaryComponent } from './components/budget/edit-program-details/r3-tab/r3-summary/r3-summary.component';
import { R3RemarksComponent } from './components/budget/edit-program-details/r3-tab/r3-remarks/r3-remarks.component';
import { DateEditorComponent } from './components/budget/edit-program-details/r3-tab/r3-entries/date-editor/date-editor.component';
import { WorkspaceService } from "./generated/api/workspace.service";
import { WorkspaceViewingComponent } from './components/programming/pom-workspace/workspace-viewing/workspace-viewing.component';
import { WorkspaceComponent } from './components/programming/update-pom-session/workspace/workspace.component';
import { WorkspaceSelectorComponent } from './components/programming/update-pom-session/workspace-selector/workspace-selector.component';
import { WorkspaceManagementComponent } from './components/programming/pom-workspace/workspace-management/workspace-management.component';
import { WorkspaceStateService } from './components/programming/pom-workspace/workspace-management/workspace-state.service';
import { WorkspaceCheckboxRendererComponent } from './components/programming/pom-workspace/workspace-management/workspace-checkbox-renderer.component';
import { WorkspaceSelectedComponent } from './components/programming/view-pom-session/workspace-selected/workspace-selected.component';
import { WorkspaceNameUpdatingRendererComponent } from './components/programming/pom-workspace/workspace-management/workspace-name-updating-renderer.component';
import { DuplicaterComponent } from './components/programming/pom-workspace/workspace-management/duplicater/duplicater.component';
import { ExporterComponent } from './components/programming/pom-workspace/workspace-management/exporter/exporter.component';
import { ImporterComponent } from './components/programming/pom-workspace/workspace-management/importer/importer.component';
import { RenamerComponent } from './components/programming/pom-workspace/workspace-management/renamer/renamer.component';
import { UnlockerComponent } from './components/programming/pom-workspace/workspace-management/unlocker/unlocker.component';

import { OrganizationToaComponent } from './components/programming/create-pom-session/organization-toa/organization-toa.component';
import { PrBarChartComponent } from './components/programming/pr-bar-chart/pr-bar-chart.component';
import { PomAnalysisComponent } from './components/programming/create-pom-session/pom-analysis/pom-analysis.component';
import { FundingRateRenderer } from './components/renderers/funding-rate-renderer/funding-rate-renderer.component';

// ROUTES
const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'about', component: AboutComponent },
  { path: 'about-private', component: AboutPrivateComponent },
  { path: 'apply', component: ApplyComponent },
  { path: 'approve-requests', component: ApproveRequestsComponent },
  { path: 'appropriation-release/:phaseId', component: AppropriationReleaseComponent },
  { path: 'bes-rdte', component: BesRdteComponent },
  { path: 'bes-proc', component: BesProcComponent },
  { path: 'charges/:phaseId', component: ChargesComponent },
  { path: 'exedetails/:lineId', component: ExecutionLineDetailsComponent },
  { path: 'community-details/:id', component: MamageCommunityDetailsComponent },
  { path: 'community-join/:requestId', component: CommunityJoinComponent },
  { path: 'community-leave/:requestId', component: CommunityLeaveComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'create-execution-phase', component: CreateExecutionPhaseComponent },
  { path: 'create-mrdb-program', component: CreateMrdbProgramComponent },
  { path: 'import-execution-data', component: ImportActualsComponent },
  { path: 'create-new-pom', component: CreatePomSessionComponent },
  { path: 'filter', component: FilterComponent },
  { path: 'funds-update', component: FundsUpdateComponent },
  { path: 'header', component: JHeaderComponent },
  { path: 'home', component: HomeComponent },
  { path: 'manage-communities', component: ManageCommunitiesComponent },
  { path: 'manage-users/:id', component: ManageUsersComponent },
  { path: 'my-community', component: MyCommunitiesComponent },
  { path: 'my-roles', component: MyRolesComponent },
  { path: 'no-access', component: NoAccessComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'server-error', component: ServerErrorComponent },
  { path: 'not-implemented', component: NotImplementedComponent },
  { path: 'oe-update', component: OeUpdateComponent },
  { path: 'open-execution', component: OpenExecutionComponent },

  { path: 'p-forms', component: PFormsComponent },
  { path: 'p40', component: P40Component },
  { path: 'p5', component: P5Component },
  { path: 'p5a', component: P5aComponent },
  { path: 'p21', component: P21Component },
  { path: 'r-forms', component: RFormsComponent },
  { path: 'r2/:scenarioId/:programElement', component: R2Component },
  { path: 'r2A', component: R2AComponent },
  { path: 'r3', component: R3Component },
  { path: 'r4', component: R4Component },
  { path: 'r4A/:programElement/:item', component: R4AComponent },

  { path: 'select-program-request/:workspaceId', component: SelectProgramRequestComponent, canActivate: [CanActivateAuth] },
  { path: 'select-program-request', component: SelectProgramRequestComponent, canActivate: [CanActivateAuth] },

  { path: 'planning', component: PlanningComponent },
  { path: 'program-execution-line/:elid', component: ProgramExecutionLineComponent },
  { path: 'program-request', component: ProgramRequestComponent },
  { path: 'restresult-error', component: RestResultErrorComponent },
  { path: 'roles', component: ManageRolesComponent },
  { path: 'roles/:commid/:roleid/:userid', component: ManageRolesComponent },
  { path: 'role-approve/:assignDrop/:requestId', component: AccessChangeApprovalComponent },
  { path: 'set-epp', component: SetEppComponent },
  { path: 'select-program-request', component: SelectProgramRequestComponent, canActivate: [CanActivateAuth] },
  { path: 'spend-plan-update', component: SpendPlansTabComponent },
  { path: 'user/:id', component: ManageSelfComponent },
  { path: 'update-pom-session/:id', component: UpdatePomSessionComponent, canActivate: [CanActivateAuth] },
  { path: 'update-pom-session', component: UpdatePomSessionComponent, canActivate: [CanActivateAuth] },
  { path: 'lock-pom-session', component: LockPomSessionComponent, canActivate: [CanActivateAuth] },
  { path: 'open-pom-session', component: OpenPomSessionComponent, canActivate: [CanActivateAuth] },
  { path: 'view-pom-session/:id', component: ViewPomSessionComponent },
  { path: 'close-pom-session', component: ClosePomSessionComponent, canActivate: [CanActivateAuth] },
  { path: 'update-program-execution/:lineId', component: UpdateProgramExecutionComponent },
  { path: 'user-approval/:requestId', component: UserApprovalComponent },
  { path: 'user-list', component: UserListComponent },
  { path: 'ufr-search', component: UfrSearchComponent, canActivate: [CanActivateAuth] },
  { path: 'ufr-approval-summary', component: UfrApprovalSummaryComponent, canActivate: [CanActivateAuth] },
  { path: 'ufr-yoe-summary', component: UfrYoeSummaryComponent, canActivate: [CanActivateAuth] },
  { path: 'ufr-approval-detail/:phaseType/:id', component: UfrApprovalDetailComponent },
  { path: 'ufr-view/:phaseType/:id', component: UfrViewComponent },
  { path: 'ufr-view/:phaseType', component: UfrViewComponent },
  { path: 'withhold/:phaseId', component: WithholdComponent },
  { path: 'worksheet-management', component: WorksheetManagementComponent, canActivate: [CanActivateAuth] },
  { path: 'worksheet-viewing', component: WorksheetViewingComponent, canActivate: [CanActivateAuth] },
  { path: 'create-new-pom', component: CreatePomSessionComponent, canActivate: [CanActivateAuth] },
  { path: 'update-pom-toas', component: CreatePomSessionComponent, canActivate: [CanActivateAuth] },
  { path: 'library', component: LibraryComponent },
  { path: 'create-budget', component: CreateBudgetComponent, canActivate: [CanActivateAuth] },
  { path: 'copy-budget', component: CopyBudgetComponent, canActivate: [CanActivateAuth] },
  { path: 'edit-budget-details', component: EditBudgetDetailsComponent, canActivate: [CanActivateAuth] },
  { path: 'edit-program-details', component: EditProgramDetailsComponent, canActivate: [CanActivateAuth] },
  { path: 'lock-position', component: LockPositionComponent, canActivate: [CanActivateAuth] },

  { path: 'workspace-management', component: WorkspaceManagementComponent, canActivate: [CanActivateAuth] },


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
    ChargesComponent,
    CommunityJoinComponent,
    CommunityLeaveComponent,
    ContactComponent,
    CreateExecutionPhaseComponent,
    CreatePomSessionComponent,
    CurrentComponent,
    DashForZeroPipe,
    FormPipe,
    ElevationComponent,
    EmphasisAreasComponent,
    FilterComponent,
    FundsTabComponent,
    FundsUpdateComponent,
    FyPipe,
    GraphsTabComponent,
    JHeaderComponent,
    AppHeaderComponent,
    HeaderOpenComponent,
    HeaderStrangerComponent,
    HeaderUserComponent,
    HomeComponent,
    IdAndNameComponent,
    ImportActualsComponent,
    ImportActualsTableComponent,
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
    NewProgramComponent,
    NewUfrComponent,
    NoCurrentCommunityMessageComponent,
    NoAccessComponent,
    NotFoundComponent,
    ServerErrorComponent,
    NotImplementedComponent,
    OeUpdateComponent,
    OnlyDigitsDirective,

    PFormsComponent,
    P40Component,
    P5Component,
    P5aComponent,
    P21Component,
    RFormsComponent,
    R2Component,
    R2AComponent,
    R3Component,
    R4Component,
    R4AComponent,

    PlanningComponent,
    PomComponent,
    VariantsTabComponent,
    UfrVariantsTabComponent,
    ProgramExecutionLineComponent,
    ProgramRequestComponent,
    ProgramTabComponent,
    ProgramsComponent,
    RequestComponent,
    RestResultErrorComponent,
    SelectProgramRequestComponent,
    SetEppComponent,
    SpendPlansTabComponent,
    UserApprovalComponent,
    UserListComponent,
    UfrSearchComponent,
    UfrApprovalSummaryComponent,
    UfrYoeSummaryComponent,
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
    MenuRolesOkDirective,
    MenuRolesNotNowDirective,
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
    DateEditorComponent,
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
    WorksheetSelectedComponent,
    ConfirmationDialogComponent,
    GridRowsComponent,
    LockedWorksheetsComponent,
    MenuBarComponent,
    PlanningMenuComponent,
    ProgrammingMenuComponent,
    BudgetMenuComponent,
    ExecutionMenuComponent,
    ReportsMenuComponent,
    ManageMenuComponent,
    AdminMenuComponent,
    UserActionsComponent,
    PrChangeNotificationsComponent,
    CreateBudgetComponent,
    CopyBudgetComponent,
    EditBudgetDetailsComponent,
    EditProgramDetailsComponent,
    TitleTabComponent,
    OverviewTabComponent,
    R1TabComponent,
    ScenarioSelectorComponent,
    R2TabComponent,
    R2aTabComponentOnBudgetDetails,
    R2aTabComponentOnProgramDetails,
    R3TabComponent,
    R3EntriesComponent,
    ProgramAndItemSelectorComponent,
    LockPositionComponent,
    SectionAComponent,
    SectionBComponent,
    SectionDComponent,
    SectionEComponent,
    RoleBuilderComponent,
    CreateMrdbProgramComponent,
    R4aTabComponent,
    R3SummaryComponent,
    R3RemarksComponent,

    WorkspaceViewingComponent,
    WorkspaceComponent,
    WorkspaceSelectorComponent,
    WorkspaceManagementComponent,
    WorkspaceCheckboxRendererComponent,
    WorkspaceSelectedComponent,
    WorkspaceNameUpdatingRendererComponent,
    DuplicaterComponent,
    ExporterComponent,
    ImporterComponent,
    RenamerComponent,
    UnlockerComponent,
    OrganizationToaComponent,
    PrBarChartComponent,
    PomAnalysisComponent,
    FundingRateRenderer,
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
    ConfirmationDialogComponent,
    DateEditorComponent,
    FundingRateRenderer,
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
    NgbDatepickerModule.forRoot(),
    DatepickerModule.forRoot(),
    AgGridModule.withComponents([]),
    Ng2GoogleChartsModule
  ],
  providers: [
    // Starting from version 6 the Angular folks recommend that singleton services are self-registering, i.e.
    // they should have the annotation:
    // @Injectable({
    //   providedIn: 'root'
    // })
    //  instead of being listed here. List here only if they cannot self-register for whatever reason.
    { provide: BASE_PATH, useValue: environment.apiUrl },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlingInterceptor, multi: true },
    { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MM/dd/yyyy h:mm:ss a') }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
