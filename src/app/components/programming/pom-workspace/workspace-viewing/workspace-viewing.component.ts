import {Component, OnInit, ViewChild} from '@angular/core';
import {GridOptions} from 'ag-grid-community';
import {AgGridNg2} from 'ag-grid-angular';
import {UserUtils} from '../../../../services/user.utils';
import {Pom, POMService, User, Workspace, WorkspaceService} from '../../../../generated';
import {NameDisplayRendererComponent} from "./name-display-renderer.component";


@Component({
  selector: 'workspace-management',
  templateUrl: './workspace-viewing.component.html',
  styleUrls: ['./workspace-viewing.component.scss']
})
export class WorkspaceViewingComponent implements OnInit {

  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private agOptions: GridOptions;
  pom: Pom;
  workspaces: Workspace[];

  constructor( private pomService: POMService,
               private workspaceService: WorkspaceService,
               private userUtils: UserUtils ) {
    this.agOptions = <GridOptions>{
      enableColResize: true,

      columnDefs: [{headerName: 'Workspace Name', field: 'workspace', minWidth: 450, cellRendererFramework: NameDisplayRendererComponent},
                   {headerName: 'Number', field: 'number', maxWidth: 90},
                   {headerName: 'Created', field: 'createdOn', width: 140, filter: "agDateColumnFilter"},
                   {headerName: 'Last Updated', field: 'lastUpdatedOn', width: 140, filter: "agDateColumnFilter"}]
    };
  }

  async ngOnInit() {
    const user: User = await this.userUtils.user().toPromise();
    this.pom = (await this.pomService.getReconciliation(user.currentCommunityId).toPromise()).result as Pom;
    await this.refreshPage();
  }

  private async refreshPage() {
    this.workspaces
 = (await this.workspaceService.getByPhaseId(this.pom.id).toPromise()).result;
    const rowData = this.workspaces
.map(workspace => {
      return {
        workspace: workspace, // custom renderer
        number: 1, // workspace.version,
        createdOn: new Date(/* workspace.createDate */).toLocaleString(),
        lastUpdatedOn: new Date(/* workspace.lastUpdateDate */).toLocaleString()
      }
    });

    this.agGrid.api.setRowData(rowData);
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

}
