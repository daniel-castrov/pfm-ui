import { Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { HeaderComponent } from '../../../header/header.component';
import { UserUtils } from '../../../../services/user.utils';
import { PomWorksheetService, POMService, Pom, PomWorksheet, User } from '../../../../generated';
import { CheckboxRendererComponent } from "./checkbox-renderer.component";
import { StateService } from "./state.service";


@Component({
  selector: 'worksheet-management',
  templateUrl: './worksheet-management.component.html',
  styleUrls: ['./worksheet-management.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorksheetManagementComponent extends StateService implements OnInit {

  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private pomWorksheets: PomWorksheet[];
  private fy: number;
  private agOptions: GridOptions;

  constructor( private pomService: POMService,
               private pomWorksheetService: PomWorksheetService,
               private userUtils: UserUtils) {
    super();
    this.agOptions = <GridOptions>{
      enableColResize: true,

      columnDefs: [{headerName: '', field: 'checkbox', maxWidth: 35, cellRendererFramework: CheckboxRendererComponent},
                   {headerName: 'Worksheet Name', field: 'worksheet', minWidth: 450},
                   {headerName: 'Number', field: 'number', maxWidth: 90},
                   {headerName: 'Created', field: 'createdOn', width: 140, filter: "agDateColumnFilter"},
                   {headerName: 'Last Updated', field: 'lastUpdatedOn', width: 140, filter: "agDateColumnFilter"}],

      rowData: [{checkbox: '*',worksheet: 'POM 18 Worksheet 1',number: '1',createdOn: 'January 1, 2018',lastUpdatedOn: 'January 2, 2018'},
                {checkbox: '*',worksheet: 'POM 18 Worksheet 2',number: '1',createdOn: 'January 2, 2018',lastUpdatedOn: 'January 5, 2018'},
                {checkbox: '*',worksheet: 'POM 18 Worksheet 3',number: '1',createdOn: 'January 3, 2018',lastUpdatedOn: 'January 6, 2018'},
                {checkbox: '*',worksheet: 'POM 17 Worksheet 3',number: '1',createdOn: 'January 4, 2018',lastUpdatedOn: 'January 8, 2018'},
                {checkbox: '*',worksheet: 'POM 18 Worksheet 2',number: '1',createdOn: 'January 5, 2018',lastUpdatedOn: 'January 9, 2018'}]
    };
  }

  async ngOnInit() {
    const user: User = await this.userUtils.user().toPromise();
    const pom = (await this.pomService.getOpen(user.currentCommunityId).toPromise()).result as Pom;
    this.fy = pom.fy;
    this.pomWorksheets = (await this.pomWorksheetService.getByPomId(pom.id).toPromise()).result;
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
    return isNaN(this.selectedRowIndex);
  }

}
