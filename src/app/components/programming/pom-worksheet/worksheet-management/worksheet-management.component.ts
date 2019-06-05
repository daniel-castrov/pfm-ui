import {Component, OnInit, ViewChild} from '@angular/core';
import {GridOptions} from 'ag-grid-community';
import {AgGridNg2} from 'ag-grid-angular';
import {UserUtils} from '../../../../services/user.utils';
import {Pom, POMService, User, WorksheetService} from '../../../../generated';
import {CheckboxRendererComponent} from "./checkbox-renderer.component";
import {Operation, StateService} from "./state.service";
import {NameUpdatingRendererComponent} from "./name-updating-renderer.component";
import {DuplicateComponent} from "./duplicate/duplicate.component";
import {RenameComponent} from "./rename/rename.component";
import {ExportComponent} from "./export/export.component";
import {ImportComponent} from "./import/import.component";
import {OperationBase} from "./operartion.base";


@Component({
  selector: 'worksheet-management',
  templateUrl: './worksheet-management.component.html',
  styleUrls: ['./worksheet-management.component.scss']
})
export class WorksheetManagementComponent implements OnInit {

  @ViewChild("agGrid") private agGrid: AgGridNg2;
  @ViewChild("duplicate") private duplicateComponent: DuplicateComponent;
  @ViewChild("rename") private renameComponent: RenameComponent;
  @ViewChild("import") private importComponent: ImportComponent;
  @ViewChild("export") private exportComponent: ExportComponent;

  private agOptions: GridOptions;
  pom: Pom;

  constructor( private pomService: POMService,
               private worksheetService: WorksheetService,
               public stateService: StateService,
               private userUtils: UserUtils ) {
    this.agOptions = <GridOptions>{
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: false
      },
      pagination: true,
      paginationPageSize: 6,
      suppressDragLeaveHidesColumns: true,
      suppressMovableColumns: true,
      suppressPaginationPanel: true,      
      columnDefs: [{headerName: '', field: 'checkbox', maxWidth: 35, cellRendererFramework: CheckboxRendererComponent},
                   {headerName: 'Worksheet Name', field: 'worksheet', minWidth: 450, cellRendererFramework: NameUpdatingRendererComponent},
                   {headerName: 'Number', field: 'number', maxWidth: 90},
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
    this.stateService.worksheets = (await this.worksheetService.getByPomId(this.pom.id).toPromise()).result;
    const rowData = this.stateService.worksheets.map(worksheet => {
      return {
        checkbox: worksheet,  // custom renderer
        worksheet: worksheet, // custom renderer
        number: worksheet.version,
        createdOn: new Date(worksheet.createDate).toLocaleString(),
        lastUpdatedOn: new Date(worksheet.lastUpdateDate).toLocaleString()
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
                                 this.exportComponent] as OperationBase[];
    operationComponents.forEach(operation => operation.init());
  }

  async onOperationOver() {
    this.stateService.selectedRowIndex = NaN;
    this.stateService.operation = null;
    await this.refreshPage();
  }
}
