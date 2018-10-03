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
  private worksheet: Map<string, string> = new Map<string, string>();
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
         headerName: '',
         field: 'checkbox',
         maxWidth: 35
       },
       {
         headerName: 'Worksheet Name',
         field: 'worksheet',
         minWidth: 450
       },
       {
         headerName: 'Version',
         field: 'version',
         maxWidth: 90
       },
       {
         headerName: 'Created',
         field: 'createdOn',
         width: 140,
         filter: "agDateColumnFilter",
       },
       {
         headerName: 'Last Updated',
         field: 'lastUpdatedOn',
         width: 140,
         filter: "agDateColumnFilter",
       }
     ];

    this.rowData = [
      { checkbox: '*', worksheet: 'POM 18 Worksheet 1', version: '1', createdOn: 'January 1, 2018', lastUpdatedOn: 'January 2, 2018' },
      { checkbox: '*', worksheet: 'POM 18 Worksheet 2', version: '1', createdOn: 'January 2, 2018', lastUpdatedOn: 'January 5, 2018' },
      { checkbox: '*', worksheet: 'POM 18 Worksheet 3', version: '1', createdOn: 'January 3, 2018', lastUpdatedOn: 'January 6, 2018' },
      { checkbox: '*', worksheet: 'POM 17 Worksheet 3', version: '1', createdOn: 'January 4, 2018', lastUpdatedOn: 'January 8, 2018' },
      { checkbox: '*', worksheet: 'POM 18 Worksheet 2', version: '1', createdOn: 'January 5, 2018', lastUpdatedOn: 'January 9, 2018' }
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
