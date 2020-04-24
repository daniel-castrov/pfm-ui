import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RequestsSummaryToaWidgetComponent } from './requests-summary-toa-widget/requests-summary-toa-widget.component';
import { RequestsSummaryOrgWidgetComponent } from './requests-summary-org-widget/requests-summary-org-widget.component';
import { ProgramSummary } from '../../models/ProgramSummary';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { ProgrammingModel } from '../../models/ProgrammingModel';
import { PomService } from '../../services/pom-service';
import { ProgrammingService } from '../../services/programming-service';
import { DashboardMockService } from '../../../pfm-dashboard-module/services/dashboard.mock.service';
import { DialogService } from '../../../pfm-coreui/services/dialog.service';
import { ListItem } from '../../../pfm-common-models/ListItem';
import { RoleService } from '../../../services/role-service';
import { Role } from '../../../pfm-common-models/Role';
import { Organization } from '../../../pfm-common-models/Organization';
import { RequestsSummaryGridComponent } from './requests-summary-grid/requests-summary-grid.component';
import { MrdbService } from '../../services/mrdb-service';
import { Program } from '../../models/Program';
import { RequestSummaryNavigationHistoryService } from './requests-summary-navigation-history.service';
import { VisibilityService } from '../../../services/visibility-service';
import { Router } from '@angular/router';
import { AppModel } from '../../../pfm-common-models/AppModel';
import { ToastService } from 'src/app/pfm-coreui/services/toast.service';
import { PlanningStatus } from 'src/app/planning-feature/models/enumerators/planning-status.model';
import { IntIntMap } from '../../models/IntIntMap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProgramStatus } from '../../models/enumerations/program-status.model';

@Component({
  selector: 'pfm-requests-summary',
  templateUrl: './requests-summary.component.html',
  styleUrls: ['./requests-summary.component.scss']
})
export class RequestsSummaryComponent implements OnInit {
  @ViewChild('toaWidetItem') toaWidgetItem: ElementRef;
  @ViewChild(RequestsSummaryToaWidgetComponent) toaWidget: RequestsSummaryToaWidgetComponent;

  @ViewChild('orgWidetItem') orgWidgetItem: ElementRef;
  @ViewChild(RequestsSummaryOrgWidgetComponent) orgWidget: RequestsSummaryOrgWidgetComponent;

  @ViewChild(RequestsSummaryGridComponent) requestsSummaryWidget: RequestsSummaryGridComponent;

  griddata: ProgramSummary[];
  availableOrgs: ListItem[];
  selectedOrg: ListItem = {
    id: 'Please select',
    name: 'Please select',
    value: 'Please select',
    isSelected: false,
    rawData: 'Please select'
  };
  programmingModelReady: boolean;
  pomDisplayYear: string;
  pomYear: number;
  options: GridsterConfig;
  addOptions: ListItem[];
  busy: boolean;
  dashboard: Array<GridsterItem>;
  showPreviousFundedProgramDialog: boolean;
  availablePrograms: ListItem[];
  orgs: Organization[];
  availableToaCharts: ListItem[];
  dropdownDefault: ListItem;
  baBlinSummary: IntIntMap;
  negativeValidationDialog = {
    title: 'Caution',
    bodyText: `At least one year's PR Totals are below the organization TOAs. Do you want to continue?`,
    continueAction: null,
    display: false
  };

  createProgramDialog = {
    title: 'Add New Program',
    form: new FormGroup({
      shortName: new FormControl('', [Validators.required]),
      longName: new FormControl('', [Validators.required]),
      type: new FormControl('PROGRAM', [Validators.required]),
      organizationId: new FormControl('', [Validators.required])
    }),
    bodyText: `At least one year's PR Totals are below the organization TOAs. Do you want to continue?`,
    continueAction: null,
    display: false
  };

  constructor(
    private programmingModel: ProgrammingModel,
    private pomService: PomService,
    private programmingService: ProgrammingService,
    private roleService: RoleService,
    private dashboardService: DashboardMockService,
    private dialogService: DialogService,
    private mrdbService: MrdbService,
    private requestSummaryNavigationHistoryService: RequestSummaryNavigationHistoryService,
    private router: Router,
    private visibilityService: VisibilityService,
    public appModel: AppModel,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.options = {
      minCols: 8,
      maxCols: 8,
      minRows: 8,
      maxRows: 8,
      itemResizeCallback: event => {
        if (event.id === 'toa-widget') {
          const w: any = this.toaWidgetItem;
          this.toaWidget.onResize(w.width, w.height);
        } else if (event.id === 'org-widget') {
          const w: any = this.orgWidgetItem;
          this.orgWidget.onResize(w.width, w.height);
        }

        this.saveWidgetLayout();
      },
      itemChangeCallback: () => {
        this.saveWidgetLayout();
      },
      draggable: {
        enabled: true
      },
      resizable: {
        enabled: true
      }
    };

    // defaults
    this.dashboard = [
      { x: 0, y: 0, cols: 4, rows: 8, id: 'org-widget' },
      {
        x: 0,
        y: 0,
        cols: 4,
        rows: 8,
        id: 'toa-widget'
      }
    ];

    this.setupVisibility();

    // Populate dropdown options
    const item: ListItem = new ListItem();
    item.name = 'Previously Funded Program';
    item.value = 'previously-funded-program';
    item.id = 'previously-funded-program';
    const item2: ListItem = new ListItem();
    item2.name = 'New Program';
    item2.value = 'new-program';
    item2.id = 'new-program';
    this.addOptions = [item, item2];

    // Get latest POM
    this.pomService.getLatestPom().subscribe(
      resp => {
        this.programmingModel.pom = (resp as any).result;
        if (this.programmingModel.pom.status !== PlanningStatus.CLOSED) {
          this.pomDisplayYear = this.programmingModel.pom.fy.toString().substr(2);
          this.pomYear = this.programmingModel.pom.fy;
        }
        this.setupDropDown();
      },
      error => {
        this.dialogService.displayDebug(error);
      }
    );

    this.roleService.getMap().subscribe(
      resp => {
        this.programmingModel.roles = resp as Map<string, Role>;
      },
      error => {
        this.dialogService.displayDebug(error);
      }
    );
  }

  setupVisibility() {
    this.visibilityService
      .isCurrentlyVisible('requests-summary-component')
      .toPromise()
      .then(response => {
        if ((response as any).result) {
          if (!this.appModel['visibilityDef']) {
            this.appModel['visibilityDef'] = {};
          }
          this.appModel['visibilityDef']['requests-summary-component'] = (response as any).result;
        }
      });
  }

  setupDropDown() {
    const self = this;
    this.programmingService.getPermittedOrganizations().subscribe(
      resp => {
        const orgs = (resp as any).result;
        this.orgs = orgs;
        const dropdownOptions: Organization[] = [];
        if (
          self.appModel.visibilityDef['requests-summary-component']['availableOrgsDropDown,option,Show All'] !== false
        ) {
          const showAllOrg = new Organization();
          showAllOrg.id = null;
          showAllOrg.abbreviation = 'Show All';
          dropdownOptions.unshift(showAllOrg);
        }
        this.availableOrgs = this.toListItemOrgs(dropdownOptions.concat(orgs));
        if (this.availableOrgs.length === 1) {
          this.organizationSelected(this.availableOrgs[0]);
        }
        this.dropdownDefault = this.selectedOrg;
        this.loadPreviousSelection();
      },
      error => {
        this.dialogService.displayDebug(error);
      }
    );
  }

  loadPreviousSelection() {
    const selectedOrganization = this.requestSummaryNavigationHistoryService.getSelectedOrganization();
    if (selectedOrganization) {
      const isShowAll = selectedOrganization.toLowerCase() === 'show all';
      const showAllValidation = organization =>
        isShowAll
          ? organization.id.toLowerCase() === selectedOrganization
          : organization.value === selectedOrganization;
      const currentOrganization = this.availableOrgs
        .map(organization => ({ ...organization, isSelected: true, rawData: organization.id }))
        .find(organization => showAllValidation(organization));
      if (currentOrganization) {
        this.selectedOrg = currentOrganization;
        this.availableOrgs.forEach((organization, index, self) => {
          if (showAllValidation(organization)) {
            self.splice(index, 1);
            self.splice(index, 0, currentOrganization);
          }
        });
        this.organizationSelected(currentOrganization);
      }
    }
  }

  private getPreferences(): void {
    this.busy = true;
    this.dashboardService.getWidgetPreferences('programming-requests-summary').subscribe(
      data => {
        this.busy = false;
        if (data) {
          const list: Array<GridsterItem> = data as any;
          if (list && list.length > 0) {
            this.dashboard = list;
          }
        }
      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      }
    );
  }

  private saveWidgetLayout(): void {
    this.dashboardService.saveWidgetPreferences('programming-requests-summary', this.dashboard).subscribe(
      data => {},
      error => {}
    );
  }

  // Build dropdown list items
  private toListItemOrgs(orgs: Organization[]): ListItem[] {
    const items: ListItem[] = [];
    for (const org of orgs) {
      const item: ListItem = new ListItem();
      item.id = org.abbreviation;
      item.name = org.abbreviation;
      item.value = org.id;
      if (org.abbreviation === this.selectedOrg.name) {
        item.isSelected = true;
      }
      items.push(item);
    }
    return items;
  }

  private toListItem(items: string[]): ListItem[] {
    const list: ListItem[] = [];
    for (const item of items) {
      const listItem: ListItem = new ListItem();
      listItem.id = item;
      listItem.name = item;
      listItem.value = item;
      list.push(listItem);
    }
    return list;
  }

  // control view on selection from dropdown
  organizationSelected(organization: ListItem) {
    this.selectedOrg = organization;
    if (this.selectedOrg.name !== 'Please select') {
      if (this.programmingModel.pom.status !== PlanningStatus.CLOSED) {
        this.getPRs(this.programmingModel.pom.workspaceId, this.selectedOrg.value);
        // Depending on organization selection change options visible and default chart shown
        if (organization.id === 'Show All') {
          const chartOptions: string[] = ['Community Status', 'Community TOA Difference', 'Funding Line Status'];
          this.availableToaCharts = this.toListItem(chartOptions);
        } else {
          const chartOptions: string[] = ['Organization Status', 'Organization TOA Difference', 'Funding Line Status'];
          this.availableToaCharts = this.toListItem(chartOptions);
        }
      } else {
        this.programmingModelReady = false;
      }
    }
    this.requestSummaryNavigationHistoryService.updateRequestSummaryNavigationHistory({
      selectedOrganization: this.selectedOrg.id.toLowerCase() === 'show all' ? 'show all' : this.selectedOrg.value
    });
  }

  private async getPRs(containerId: string, organizationId: string): Promise<void> {
    this.busy = true;
    this.programmingModelReady = false;
    await this.programmingService
      .getPRsForContainer(containerId, organizationId)
      .toPromise()
      .then(resp => {
        this.programmingModel.programs = (resp as any).result;
      });
    await this.programmingService
      .getBaBlinSummary(containerId, organizationId)
      .toPromise()
      .then(resp => {
        this.baBlinSummary = (resp as any).result;
      });
    this.programmingModelReady = true;
    this.busy = false;
  }

  handleAdd(addEvent: any) {
    if (addEvent.action === 'new-program') {
      this.createProgramDialog.form.patchValue({
        shortName: '',
        longName: '',
        type: 'PROGRAM',
        organizationId: this.selectedOrg.value ?? ''
      });
      this.createProgramDialog.display = true;
    } else if (addEvent.action === 'previously-funded-program') {
      this.busy = true;
      this.mrdbService.getProgramsMinusPrs(this.selectedOrg.value, this.programmingModel.programs).subscribe(
        resp => {
          const programsList: ListItem[] = [];
          for (const program of resp as Program[]) {
            const item: ListItem = new ListItem();
            item.id = program.shortName;
            item.name = program.shortName;
            item.value = program.id;
            programsList.push(item);
          }
          this.availablePrograms = programsList;
          this.busy = false;
          this.showPreviousFundedProgramDialog = true;
        },
        error => {}
      );
    }
  }

  importProgramSelected($event: any) {}

  onImportProgram() {}

  onApproveOrganization(): void {
    this.approveOrganization();
  }

  approveOrganization(skipToaValidation?: boolean) {
    this.programmingService
      .processPRsForContainer(
        this.programmingModel.pom.workspaceId,
        'Approve Organization',
        this.selectedOrg.value,
        skipToaValidation
      )
      .subscribe(
        resp => {
          this.organizationSelected(this.selectedOrg);
          this.toastService.displaySuccess('All program requests have been approved successfully.');
        },
        error => {
          this.handleActionError(error, this.approveOrganization.bind(this));
        },
        () => (this.negativeValidationDialog.display = false)
      );
  }

  onReturnOrganization(): void {
    this.programmingService
      .processPRsForContainer(this.programmingModel.pom.workspaceId, 'Return Organization', this.selectedOrg.value)
      .subscribe(
        resp => {
          this.organizationSelected(this.selectedOrg);
          this.toastService.displaySuccess('Return organization successful.');
        },
        error => {
          const err = (error as any).error;
          this.toastService.displayError(err.error);
        }
      );
  }

  onAdvanceOrganization() {
    this.advanceOrganization();
  }

  advanceOrganization(skipToaValidation?: boolean) {
    this.programmingService
      .processPRsForContainer(
        this.programmingModel.pom.workspaceId,
        'Advance Organization',
        this.selectedOrg.value,
        skipToaValidation
      )
      .subscribe(
        resp => {
          this.organizationSelected(this.selectedOrg);
          this.toastService.displaySuccess('All program requests successfully advanced.');
        },
        error => {
          this.handleActionError(error, this.advanceOrganization.bind(this));
        },
        () => (this.negativeValidationDialog.display = false)
      );
  }

  onApproveAllPrs(): void {
    this.approveAllPRs();
  }

  approveAllPRs(skipToaValidation?: boolean): void {
    this.programmingService
      .processPRsForContainer(this.programmingModel.pom.workspaceId, 'Approve All PRs', undefined, skipToaValidation)
      .subscribe(
        resp => {
          this.organizationSelected(this.selectedOrg);
          this.toastService.displaySuccess('All program requests successfully approved.');
        },
        error => {
          this.handleActionError(error, this.approveAllPRs.bind(this));
        },
        () => (this.negativeValidationDialog.display = false)
      );
  }

  handleActionError(error, action) {
    const err = (error as any).error;
    const errorStr = err.error;
    if (errorStr.toLowerCase().includes('below')) {
      this.negativeValidationDialog.display = true;
      this.negativeValidationDialog.continueAction = () => {
        action(true);
      };
    } else {
      this.toastService.displayError(err.error);
    }
  }

  getRespRoleId(roleStr: string): any {
    let respRoleId = '';
    this.programmingModel.roles.forEach(role => {
      if (role.name === roleStr) {
        respRoleId = role.id;
      }
    });

    return respRoleId;
  }

  onGridDataChange(data: any): void {
    this.griddata = data;
  }

  onCancelNegativeValidationDialog() {
    this.negativeValidationDialog.display = false;
  }

  onCancelCreateProgramDialog() {
    this.createProgramDialog.display = false;
  }

  onCreateProgramAction() {
    const program = {
      shortName: this.createProgramDialog.form.get(['shortName']).value,
      longName: this.createProgramDialog.form.get(['longName']).value,
      type: this.createProgramDialog.form.get(['type']).value,
      organizationId: this.createProgramDialog.form.get(['organizationId']).value
    } as Program;
    program.containerId = this.programmingModel.pom.workspaceId;
    program.programStatus = ProgramStatus.SAVED;
    const canSave = this.createProgramDialog.form.valid;
    if (canSave) {
      this.programmingService.create(program).subscribe(
        resp => {
          const resultProgram = resp.result as Program;
          this.toastService.displaySuccess('Program Request saved successfully.');
          this.router.navigate([
            '/programming/requests/details/' + resultProgram.id,
            {
              pomYear: this.pomYear
            }
          ]);
        },
        error => {
          this.toastService.displayError('An error has occurred while attempting to save program.');
        },
        () => (this.busy = false)
      );
    } else {
      if (this.createProgramDialog.form.get('shortName').errors?.required) {
        this.toastService.displayError('Program ID field must not be empty.');
      }
      if (this.createProgramDialog.form.get('longName').errors?.required) {
        this.toastService.displayError('Program Name field must not be empty.');
      }
      if (this.createProgramDialog.form.get('type').errors?.required) {
        this.toastService.displayError('Program Type field must not be empty.');
      }
      if (this.createProgramDialog.form.get('organizationId').errors?.required) {
        this.toastService.displayError('Organization field must not be empty.');
      }
    }
  }
}
