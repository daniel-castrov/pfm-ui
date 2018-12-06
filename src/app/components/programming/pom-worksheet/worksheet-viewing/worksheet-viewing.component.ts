import {Component, OnInit, ViewChild} from '@angular/core';
import {GridOptions} from 'ag-grid';
import {AgGridNg2} from 'ag-grid-angular';
import {HeaderComponent} from '../../../header/header.component';
import {UserUtils} from '../../../../services/user.utils';
import {Pom, POMService, User, Worksheet, WorksheetService} from '../../../../generated';
import {NameViewingRendererComponent} from "./name-viewing-renderer.component";


@Component({
  selector: 'worksheet-management',
  templateUrl: './worksheet-viewing.component.html',
  styleUrls: ['./worksheet-viewing.component.scss']
})
export class WorksheetViewingComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private agOptions: GridOptions;
  pom: Pom;
  worksheets: Worksheet[];

  constructor( private pomService: POMService,
               private worksheetService: WorksheetService,
               private userUtils: UserUtils ) {
    this.agOptions = <GridOptions>{
      enableColResize: true,

      columnDefs: [{headerName: 'Worksheet Name', field: 'worksheet', minWidth: 450, cellRendererFramework: NameViewingRendererComponent},
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
    this.worksheets = (await this.worksheetService.getByPomId(this.pom.id).toPromise()).result;
    const rowData = this.worksheets.map(worksheet => {
      return {
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

}
