import {Component, OnInit, ViewChild} from '@angular/core';
import {GridOptions} from 'ag-grid';
import {AgGridNg2} from 'ag-grid-angular';
import {UserUtils} from '../../../../services/user.utils';
import {Pom, POMService, User, WorkspaceService} from '../../../../generated';
import {DuplicaterComponent} from "./duplicater/duplicater.component";
import {RenamerComponent} from "./renamer/renamer.component";
import {ExporterComponent} from "./exporter/exporter.component";
import {ImporterComponent} from "./importer/importer.component";
import {UnlockerComponent} from "./unlocker/unlocker.component";
import { NameUpdatingRendererComponent } from '../../pom-worksheet/worksheet-management/name-updating-renderer.component';
import { WorkspaceStateService, Operation } from './workspace-state.service';
import { IOperation } from './operation.interface';
import { WorkspaceCheckboxRendererComponent } from './workspace-checkbox-renderer.component';
import { BulkChangeRendererComponent } from './bulk-change-renderer.component';


@Component({
  selector: 'workspace-management',
  templateUrl: './workspace-management.component.html',
  styleUrls: ['./workspace-management.component.scss']
})
export class WorkspaceManagementComponent implements OnInit {

  @ViewChild("agGrid") private agGrid: AgGridNg2;
  @ViewChild("duplicater") private duplicateComponent: DuplicaterComponent;
  @ViewChild("renamer") private renameComponent: RenamerComponent;
  @ViewChild("importer") private importComponent: ImporterComponent;
  @ViewChild("exporter") private exportComponent: ExporterComponent;
  @ViewChild("unlocker") private unlockComponent: UnlockerComponent;

  private agOptions: GridOptions;
  pom: Pom;

  constructor( private pomService: POMService,
               private workspaceService: WorkspaceService,
               public stateService: WorkspaceStateService,
               private userUtils: UserUtils ) {
    this.agOptions = <GridOptions>{
      enableColResize: true,

      columnDefs: [{headerName: '', field: 'checkbox', maxWidth: 35, cellRendererFramework: WorkspaceCheckboxRendererComponent},
                   {headerName: 'Workspace Name', field: 'workspace', minWidth: 450, cellRendererFramework: NameUpdatingRendererComponent},
                   {headerName: 'Bulk Change', field: 'workspace', maxWidth: 100, cellRendererFramework: BulkChangeRendererComponent},
                   {headerName: 'Created', field: 'createdOn', width: 140, filter: "agDateColumnFilter"},
                   {headerName: 'Last Updated', field: 'lastUpdatedOn', width: 140, filter: "agDateColumnFilter"}]
    };
  }

  async ngOnInit() {
    const user: User = await this.userUtils.user().toPromise();
    this.pom = (await this.pomService.getOpen(user.currentCommunityId).toPromise()).result as Pom;
    await this.refreshPage();
  }

  private async refreshPage() {
    this.stateService.workspaces = (await this.workspaceService.getByPhaseId(this.pom.id).toPromise()).result;
    const rowData = this.stateService.workspaces.map(workspace => {
      return {
        checkbox: workspace,  // custom renderer
        workspace: workspace, // custom renderer
        number: workspace.version,
        createdOn: new Date(workspace.createDate).toLocaleString(),
        lastUpdatedOn: new Date(workspace.lastUpdateDate).toLocaleString()
      }
    });

    this.agGrid.api.setRowData(rowData);
    this.initOperations();
  }

  onPageSizeChanged(event) {
    const selectedValue = Number(event.target.value);
    this.agGrid.api.paginationSetPageSize(selectedValue);
    this.agGrid.api.sizeColumnsToFit();
  }

  onGridReady(params) {
     setTimeout(() => {
       params.api.sizeColumnsToFit();
     }, 500);

     window.addEventListener("resize", () => {
       setTimeout(() => {
         params.api.sizeColumnsToFit();
       });
     });
  }

  isRowNotSelected(): boolean {
    return isNaN(this.stateService.selectedRowIndex);
  }

  startOperation(operation: Operation) {
    this.stateService.operation=operation;
  }

  private initOperations() {
    const operationComponents = [this.duplicateComponent,
                                 this.renameComponent,
                                 this.importComponent,
                                 this.exportComponent,
                                 this.unlockComponent] as IOperation[];
    operationComponents.forEach(operation => operation.init());
  }

  async onOperationOver() {
    this.stateService.selectedRowIndex = NaN;
    this.stateService.operation = null;
    await this.refreshPage();
  }
}
