import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ProgrammingFeatureRoutingModule } from './programming-feature-routing.module';
import { ProgrammingFeatureComponent } from './programming-feature.component';
import { CreateProgrammingComponent } from './create-programming/create-programming.component';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';
import { HttpClientModule } from '@angular/common/http';
import { PfmSecureFileuploadModule } from '../pfm-secure-fileupload/pfm-secure-fileupload.module';
import { OpenProgrammingComponent } from './open-programming/open-programming.component';
import { LockProgrammingComponent } from './lock-programming/lock-programming.component';
import { CloseProgrammingComponent } from './close-programming/close-programming.component';
import { ToaComponent } from './toa/toa.component';
import { RequestsComponent } from './requests/requests.component';
import { RequestsApprovalComponent } from './requests-approval/requests-approval.component';
import { UfrRequestsComponent } from './ufr-requests/ufr-requests.component';
import { UfrRequestsApprovalComponent } from './ufr-requests-approval/ufr-requests-approval.component';
import { TotalAppropriationPriorityComponent } from './total-appropriation-priority/total-appropriation-priority.component';
import { WorkSpaceManagementComponent } from './work-space-management/work-space-management.component';
import { RequestsSummaryGridComponent } from './requests/requests-summary/requests-summary-grid/requests-summary-grid.component';
import { RequestsSummaryOrgWidgetComponent } from './requests/requests-summary/requests-summary-org-widget/requests-summary-org-widget.component';
import { RequestsSummaryToaWidgetComponent } from './requests/requests-summary/requests-summary-toa-widget/requests-summary-toa-widget.component';
import { GridsterModule } from 'angular-gridster2';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { OrganizationServiceImpl } from '../services/organization-service-impl.service';
import { OrganizationService } from '../services/organization-service';
import { PomService } from './services/pom-service';
import { PomServiceImpl } from './services/pom-service-impl.service';
import { CreateProgrammingCommunityGraphComponent } from './create-programming/create-programming-community-graph/create-programming-community-graph.component';
import { ProgrammingService } from './services/programming-service';
import { ProgrammingServiceImpl } from './services/programming-service-impl.service';
import { ProgrammingModel } from './models/ProgrammingModel';
import { RequestsFundingLineGridComponent } from './requests/requests-details/requests-funding-line-grid/requests-funding-line-grid.component';
import { CreateProgrammingOrganizationGraphComponent } from './create-programming/create-programming-organization-graph/create-programming-organization-graph.component';
import { RequestsDetailsComponent } from './requests/requests-details/requests-details.component';
import { RequestsSummaryComponent } from './requests/requests-summary/requests-summary.component';
import { RoleService } from '../services/role-service';
import { RoleServiceImpl } from '../services/role-service-impl.service';
import { ScheduleComponent } from './requests/requests-details/schedule/schedule.component';
import { MrdbService } from './services/mrdb-service';
import { MrdbServiceImpl } from './services/mrdb-service-impl.service';
import { RequestSummaryNavigationHistoryService } from './requests/requests-summary/requests-summary-navigation-history.service';
import { VisibilityService } from '../services/visibility-service';
import { VisibilityServiceImpl } from '../services/visibility-service-impl.service';
import { RequestsDetailsFormComponent } from './requests/requests-details/requests-details-form/requests-details-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { JustificationComponent } from './requests/requests-details/justification/justification.component';
import { ScopeComponent } from './requests/requests-details/scope/scope.component';

@NgModule({
  declarations: [
    ProgrammingFeatureComponent,
    CreateProgrammingComponent,
    OpenProgrammingComponent,
    LockProgrammingComponent,
    CloseProgrammingComponent,
    ToaComponent,
    RequestsComponent,
    RequestsApprovalComponent,
    UfrRequestsComponent,
    UfrRequestsApprovalComponent,
    TotalAppropriationPriorityComponent,
    WorkSpaceManagementComponent,
    RequestsSummaryGridComponent,
    RequestsSummaryOrgWidgetComponent,
    RequestsSummaryToaWidgetComponent,
    CreateProgrammingCommunityGraphComponent,
    CreateProgrammingOrganizationGraphComponent,
    RequestsFundingLineGridComponent,
    RequestsSummaryComponent,
    RequestsDetailsComponent,
    ScheduleComponent,
    JustificationComponent,
    RequestsDetailsFormComponent,
    ScopeComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    GridsterModule,
    Ng2GoogleChartsModule,
    PfmCoreuiModule,
    PfmSecureFileuploadModule,
    TabsModule.forRoot(),
    ProgrammingFeatureRoutingModule,
    AngularFontAwesomeModule
  ],
  providers: [{ provide: ProgrammingService, useClass: ProgrammingServiceImpl },
  { provide: PomService, useClass: PomServiceImpl },
  { provide: OrganizationService, useClass: OrganizationServiceImpl },
  { provide: RoleService, useClass: RoleServiceImpl },
  { provide: MrdbService, useClass: MrdbServiceImpl },
  { provide: VisibilityService, useClass: VisibilityServiceImpl },
    ProgrammingModel,
    RequestSummaryNavigationHistoryService]
})
export class ProgrammingFeatureModule {
}
