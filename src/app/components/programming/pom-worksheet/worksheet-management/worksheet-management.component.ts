import { Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { HeaderComponent } from '../../../header/header.component';
import { UserUtils } from '../../../../services/user.utils';
import { PomWorksheetService, POMService, Pom, PomWorksheet, User } from '../../../../generated';
import { CheckboxRendererComponent } from "./checkbox-renderer.component";
import { StateService } from "./state.service";
import {NameRendererComponent} from "./name-renderer.component";


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
                   {headerName: 'Worksheet Name', field: 'worksheet', minWidth: 450, cellRendererFramework: NameRendererComponent},
                   {headerName: 'Number', field: 'number', maxWidth: 90},
                   {headerName: 'Created', field: 'createdOn', width: 140, filter: "agDateColumnFilter"},
                   {headerName: 'Last Updated', field: 'lastUpdatedOn', width: 140, filter: "agDateColumnFilter"}]
    };
  }

  async ngOnInit() {
    const user: User = await this.userUtils.user().toPromise();
    const pom = (await this.pomService.getOpen(user.currentCommunityId).toPromise()).result as Pom;
    this.fy = pom.fy;
    this.pomWorksheets = (await this.pomWorksheetService.getByPomId(pom.id).toPromise()).result;
    const rowData = this.pomWorksheets.map(worksheet => { return {
      checkbox: '', // custom renderer
      worksheet: {"name":worksheet.name,"id":worksheet.id},
      number: worksheet.version,
      createdOn: new Date(worksheet.createDate).toLocaleString(),
      lastUpdatedOn: new Date(worksheet.lastUpdateDate).toLocaleString()}});

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

}
