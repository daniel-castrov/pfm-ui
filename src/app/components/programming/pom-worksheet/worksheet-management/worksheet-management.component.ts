import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';

// Other Components
import { HeaderComponent } from '../../../header/header.component';
import { UserUtils } from '../../../../services/user.utils';

import { PomWorksheetService, POMService } from '../../../../generated';
import { Pom, PomWorksheet, PomWorksheetRow } from '../../../../generated';

@Component({
  selector: 'worksheet-management',
  templateUrl: './worksheet-management.component.html',
  styleUrls: ['./worksheet-management.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorksheetManagementComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private pomWorksheet:PomWorksheet[]=[];
  private fy:number;
  private agOptions: GridOptions;
  private columnDefs: any[];
  private rowData: any[];

  ngOnInit() {

    this.globalsService.user().subscribe( user => {

      this.pomSvc.getOpen(user.currentCommunityId).subscribe( data => {
        let pom:Pom = data.result;
        this.fy = pom.fy;
        this.pomWSSvc.getByPomId(pom.id).subscribe( data2 => {
          this.pomWorksheet = data2.result;
          console.log(this.pomWorksheet);
        });

      });
    });
  }

  constructor(
    private pomSvc:POMService,
    private pomWSSvc:PomWorksheetService,
    private globalsService: UserUtils,

  ) {

    this.agOptions = <GridOptions>{
      enableColResize: true,
    }
    this.columnDefs = [
       {
         headerName: 'checkbox',
         field: 'checkbox',
         width: 40
       },
       {
         headerName: 'Worksheet Name',
         field: 'worksheetName',
         width: 400
       },
       {
         headerName: 'Version',
         field: 'version',
         width: 100,

       },
       {
         headerName: 'Created',
         field: 'createdOn',
         width: 140
       },
       {
         headerName: 'Last Updated',
         field: 'lastUpdatedOn',
         width: 140
       }
     ];

    this.rowData = [
      { checkbox: '*', worksheetName: 'POM 18 Worksheet 1', version: '1', createdOn: 1100, lastUpdatedOn: 1100 },
      { checkbox: '*', worksheetName: 'POM 18 Worksheet 2', version: '1', createdOn: 500, lastUpdatedOn: 1100 },
      { checkbox: '*', worksheetName: 'POM 18 Worksheet 3', version: '1', createdOn: 5550, lastUpdatedOn: 1100 },
      { checkbox: '*', worksheetName: 'POM 17 Worksheet 3', version: '1', createdOn: 45000, lastUpdatedOn: 1100 },
      { checkbox: '*', worksheetName: 'POM 18 Worksheet 2', version: '1', createdOn: 50000, lastUpdatedOn: 110 }
    ];
  }

  onPageSizeChanged(event) {
    var selectedValue = Number(event.target.value);
    this.agGrid.api.paginationSetPageSize(selectedValue);
    this.agGrid.api.sizeColumnsToFit();
  }

   onGridReady(params) {
     setTimeout(() => {
       params.api.sizeColumnsToFit();
     }, 500);
     window.addEventListener("resize", function() {
       setTimeout(() => {
         params.api.sizeColumnsToFit();
       });
     });
   }
}
