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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { JustificationComponent } from './requests/requests-details/justification/justification.component';
import { ScopeComponent } from './requests/requests-details/scope/scope.component';
import { AssetsComponent } from './requests/requests-details/assets/assets.component';
import { PlanningService } from '../planning-feature/services/planning-service';
import { PlanningServicesImpl } from '../planning-feature/services/planning-services-impl.service';
import { TagService } from './services/tag.service';
import { TagServiceImpl } from './services/tag-service-impl.service';
import { TeamLeadService } from './services/team-lead.service';
import { TeamLeadServiceImpl } from './services/team-lead-impl.service';
import { EvaluationMeasureService } from './services/evaluation-measure.service';
import { EvaluationMeasureServiceImpl } from './services/evaluation-measure-impl.service';
import { ProcessPrioritizationServiceImpl } from './services/process-prioritization-impl.service';
import { ProcessPrioritizationService } from './services/process-prioritization.service';
import { FundingLineService } from './services/funding-line.service';
import { FundingLineServiceImpl } from './services/funding-line-impl.service';
import { AssetService } from './services/asset.service';
import { AssetServiceImpl } from './services/asset-impl.service';
import { PfmSecureFiledownloadModule } from '../pfm-secure-filedownload/pfm-secure-filedownload.module';
import { AssetSummaryService } from './services/asset-summary.service';
import { AssetSummaryServiceImpl } from './services/asset-summary-impl.service';
import { PropertyService } from './services/property.service';
import { PropertyServiceImpl } from './services/property-impl.service';
import { ScheduleService } from './services/schedule.service';
import { ScheduleServiceImpl } from './services/schedule-impl.service';
import { WorkspaceService } from './services/workspace.service';
import { WorkspaceServiceImpl } from './services/workspace-impl.service';
import { FundingLineHistoryServiceImpl } from './services/funding-line-history-impl.service';
import { FundingLineHistoryService } from './services/funding-line-history.service';
import { CompareWorkSpacesComponent } from './work-space-management/compare-work-spaces/compare-work-spaces.component';

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
    CompareWorkSpacesComponent,
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
    ScopeComponent,
    AssetsComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    GridsterModule,
    Ng2GoogleChartsModule,
    PfmCoreuiModule,
    PfmSecureFileuploadModule,
    PfmSecureFiledownloadModule,
    TabsModule.forRoot(),
    ProgrammingFeatureRoutingModule,
    FontAwesomeModule
  ],
  providers: [
    { provide: ProgrammingService, useClass: ProgrammingServiceImpl },
    { provide: PomService, useClass: PomServiceImpl },
    { provide: OrganizationService, useClass: OrganizationServiceImpl },
    { provide: RoleService, useClass: RoleServiceImpl },
    { provide: MrdbService, useClass: MrdbServiceImpl },
    { provide: VisibilityService, useClass: VisibilityServiceImpl },
    { provide: PlanningService, useClass: PlanningServicesImpl },
    { provide: TagService, useClass: TagServiceImpl },
    { provide: TeamLeadService, useClass: TeamLeadServiceImpl },
    { provide: EvaluationMeasureService, useClass: EvaluationMeasureServiceImpl },
    { provide: ProcessPrioritizationService, useClass: ProcessPrioritizationServiceImpl },
    { provide: FundingLineService, useClass: FundingLineServiceImpl },
    { provide: AssetService, useClass: AssetServiceImpl },
    { provide: AssetSummaryService, useClass: AssetSummaryServiceImpl },
    { provide: PropertyService, useClass: PropertyServiceImpl },
    { provide: ScheduleService, useClass: ScheduleServiceImpl },
    { provide: WorkspaceService, useClass: WorkspaceServiceImpl },
    { provide: FundingLineHistoryService, useClass: FundingLineHistoryServiceImpl },
    ProgrammingModel,
    RequestSummaryNavigationHistoryService
  ]
})
export class ProgrammingFeatureModule {}
