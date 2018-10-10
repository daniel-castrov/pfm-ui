import {Component, OnInit, ViewChild} from '@angular/core';
import {GridOptions} from 'ag-grid';
import {AgGridNg2} from 'ag-grid-angular';
import {HeaderComponent} from '../../../header/header.component';
import {UserUtils} from '../../../../services/user.utils';
import {Pom, POMService, User, Worksheet, WorksheetService} from '../../../../generated';
import {CheckboxRendererComponent} from "./checkbox-renderer.component";
import {StateService} from "./state.service";
import {NameRendererComponent} from "./name-renderer.component";


@Component({
  selector: 'worksheet-management',
  templateUrl: './worksheet-management.component.html',
  styleUrls: ['./worksheet-management.component.scss']
})
export class WorksheetManagementComponent extends StateService implements OnInit {

  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private fy: number;
  private agOptions: GridOptions;
  private pomId: string;

  constructor( private pomService: POMService,
               private worksheetService: WorksheetService,
               private userUtils: UserUtils ) {
    super();
    this.agOptions = <GridOptions>{
      enableColResize: true,

      columnDefs: [{headerName: '', field: 'checkbox', maxWidth: 35, cellRendererFramework: CheckboxRendererComponent},
                   {headerName: 'Worksheet Name', field: 'worksheet', minWidth: 450, cellRendererFramework: NameRendererComponent},
                   {headerName: 'Version', field: 'number', maxWidth: 90},
                   {headerName: 'Created', field: 'createdOn', width: 140, filter: "agDateColumnFilter"},
                   {headerName: 'Last Updated', field: 'lastUpdatedOn', width: 140, filter: "agDateColumnFilter"}]
    };
  }

  async ngOnInit() {
    const user: User = await this.userUtils.user().toPromise();
    const pom = (await this.pomService.getOpen(user.currentCommunityId).toPromise()).result as Pom;
    this.pomId = pom.id;
    this.fy = pom.fy;
    await this.updateWorksheets();
  }

  private async updateWorksheets() {
    StateService.worksheets = (await this.worksheetService.getByPomId(this.pomId).toPromise()).result;
    const rowData = StateService.worksheets.map(worksheet => {
      return {
        checkbox: worksheet,  // custom renderer
        worksheet: worksheet, // custom renderer
        number: worksheet.version,
        createdOn: new Date(worksheet.createDate).toLocaleString(),
        lastUpdatedOn: new Date(worksheet.lastUpdateDate).toLocaleString()
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

  isRowNotSelected(): boolean {
    return isNaN(this.selectedRowIndex);
  }

  onOperationOver() {
    this.updateWorksheets();
    // Trigger ngOnChange() to make sure the operation components (Duplicate, Rename, etc.) are initialized, possible unnecessary.
    // Feels cleaner, with it thought.
    this.selectedWorksheet = {...this.selectedWorksheet};
    this.operation = null;
  }
}
