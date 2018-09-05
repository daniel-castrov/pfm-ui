import { ProgramTreeUtils } from './../../../../utils/program-tree-utils';
import { UserUtils } from '../../../../services/user.utils';
import { FilterUfrsComponent } from './../filter-ufrs/filter-ufrs.component';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridNg2 } from "ag-grid-angular";
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ProgramsService, User, Program, UFRsService, UFR, UFRFilter } from '../../../../generated';

@Component({
  selector: 'all-ufrs',
  templateUrl: './all-ufrs.component.html',
  styleUrls: ['./all-ufrs.component.scss']
})
export class AllUfrsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sorter: MatSort;

  @Input() private filterUfrsComponent: FilterUfrsComponent;
  @Input() private mapCycleIdToFy: Map<string, string>;

  private matTableDataSource: MatTableDataSource<UFR> = new MatTableDataSource<UFR>();
  private mapProgramIdToName: Map<string, string> = new Map<string, string>();// mrid, fullname
  private user: User;

  // agGrid   
  @ViewChild("agGrid") private agGrid: AgGridNg2;
  private rowData: any[];
  private colDefs;


  constructor(private ufrsService: UFRsService,
              private userUtils: UserUtils,
              private programsService: ProgramsService,
              private router: Router) {}

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();
    const programs: Program[] = (await this.programsService.getAll().toPromise()).result;
    this.initProgramIdToName(programs);
    //this.search();
    this.loadTableData();

    this.initGrid( 12 ); 
    this.populateRowData();
    setTimeout(() => {
      this.agGrid.api.sizeColumnsToFit()
    });

  }

  // ngOnChanges() {

  //   if ( true ) {
  //     this.initGrid( 12 ); 
  //     this.populateRowData();
  //     setTimeout(() => {
  //       this.agGrid.api.sizeColumnsToFit()
  //     });
  //   }
  // }

  private initGrid(by: number) {

    this.agGrid.gridOptions = {
      columnDefs: this.setAgGridColDefs(by),
    }
  }

  private setAgGridColDefs(by: number): any {

    let colKeys:string[] = ["UDR#","UFR Name","Prog Id","Status","Priority","Disposition",
                            "Last Updated","Funding Request","Func Area","Organization"];

    this.colDefs = [];
    
    colKeys.forEach( colKey =>
      {
        let coldef = {
          headerName: colKey,
          suppressMenu: true,
          field: colKey,
          width: 102,
          editable: false
        }
      this.colDefs.push(coldef);
    });

    // // First column - id
    // this.colDefs =
    //   [{
    //     headerName: "",
    //     suppressMenu: true,
    //     field: 'id',
    //     width: 102,
    //     editable: false,
    //     cellClass: "font-weight-bold"
    //   }];

    // Columns for FYs
    // for (var i = 0; i < 5; i++) {
    //   this.colDefs.push(
    //     {
    //       headerName: "FY" + (by + i - 2000),
    //       type: "numericColumn",
    //       suppressMenu: true,
    //       field: (by + i).toString(),
    //       width: 92,
    //       editable: false,
    //       //valueFormatter: params => { return this.currencyFormatter(params) },
    //       cellClassRules: {
    //          'font-weight-bold': params => { return params.data.id == 'Allocated TOA'  } ,
    //          'font-red' : params => { return params.value < 0 }, 
    //        },
    //     });
    // }

    // Last column - total
    // this.colDefs.push(
    //   {
    //     headerName: "Total",
    //     type: "numericColumn",
    //     suppressMenu: true,
    //     field: 'total',
    //     width: 92,
    //     editable: false,
    //     //valueFormatter: params => { return this.currencyFormatter(params) },
    //     cellClassRules: {
    //       'font-red' : params => { return params.value < 0 },
    //     },
    //   });
  }

  private onGridReady(params) {
    params.api.sizeColumnsToFit();
    window.addEventListener("resize", function () {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }


  async populateRowData(){
  
    const ufrFilter: UFRFilter = {};
    let ufrs:UFR[] =   (await this.ufrsService.search( this.user.currentCommunityId, ufrFilter ).toPromise()).result;

    console.log(ufrs);

    let rows:any[] = [];
    ufrs.forEach( ufr =>{
      let row:any = new Object();
      row["UDR#"] = ufr.
      row["UFR Name"] = i+"B"
      row["Prog Id"] = i+"C"
      row["Status"] = i+"D"
      row["Priority"] = i+"E"
      row["Disposition"] = i+"F"
      row["Last Updated"] = i+"G"
      row["Funding Request"] = i+"H"
      row["Func Area"] = i+"I"
      row["Organization"] = i+"J"
      alldata.push(data);


    });


    let alldata:any[] = [];
    let data:any = new Object();
    for ( let i =0; i<10; i++ ){
      let data:any = new Object();
      data["UDR#"] = i+"A"
      data["UFR Name"] = i+"B"
      data["Prog Id"] = i+"C"
      data["Status"] = i+"D"
      data["Priority"] = i+"E"
      data["Disposition"] = i+"F"
      data["Last Updated"] = i+"G"
      data["Funding Request"] = i+"H"
      data["Func Area"] = i+"I"
      data["Organization"] = i+"J"
      alldata.push(data);
    }

    

    this.rowData = alldata;
}

  private initProgramIdToName(programs: Program[]) {
    ProgramTreeUtils.fullnames(programs).forEach((fullname, program) => {
      this.mapProgramIdToName.set(program.id, fullname);
    });
  }

  // async search() {
  //   const ufrFilter: UFRFilter = {};
  //   if (this.filterUfrsComponent.useCycle) ufrFilter.cycle = this.filterUfrsComponent.selectedCycle.replace(/([0-9]+)/, "20$1");
  //   if (this.filterUfrsComponent.useDates) {
  //     ufrFilter.from = this.filterUfrsComponent.fromDate;
  //     ufrFilter.to = this.filterUfrsComponent.toDate;
  //   }
  //   if (this.filterUfrsComponent.useDisposition) ufrFilter.disposition = this.filterUfrsComponent.selectedDisposition.toUpperCase().replace( ' ', '_' );
  //   if (this.filterUfrsComponent.useFunctionalArea) ufrFilter.fa = this.filterUfrsComponent.selectedFunctionalArea;
  //   if (this.filterUfrsComponent.useOrganization) ufrFilter.orgId = this.filterUfrsComponent.selectedOrganizationId;
  //   if (this.filterUfrsComponent.useStatus) ufrFilter.status = this.filterUfrsComponent.selectedStatus;

  //   this.matTableDataSource.data = (await this.ufrsService.search( this.user.currentCommunityId, ufrFilter ).toPromise()).result;
  //   // FIXME: I think these lines belong in ngAfterViewInit, but I can't get
  //   // it to work there. The sorter and paginator aren't set there (?)
  //   // so this is a not-too-ugly workaround.
  //   this.matTableDataSource.sort = this.sorter;
  //   this.matTableDataSource.paginator = this.paginator;
  // }

  async loadTableData(){

    const ufrFilter: UFRFilter = {};
    this.matTableDataSource.data = (await this.ufrsService.  search( this.user.currentCommunityId, ufrFilter ).toPromise()).result;
    // FIXME: I think these lines belong in ngAfterViewInit, but I can't get
    // it to work there. The sorter and paginator aren't set there (?)
    // so this is a not-too-ugly workaround.
    this.matTableDataSource.sort = this.sorter;
    this.matTableDataSource.paginator = this.paginator;
  }

  navigate(row) {
    this.router.navigate(['/ufr-view', row.id]);
  }

  // Only considers the immediate parent, i.e. cannot consider three levels in the hierarchy, i.e. AAA/BBB/CCC
  getFullProgramName(ufr: UFR): string {
    return '';
    // todo: return the program name if the shorty is a Program. '' otherwise.
  }

  ufrNumber(ufr: UFR): string {
    const fullFy = +this.mapCycleIdToFy.get(ufr.phaseId).slice(-4); // the value stored in this.mapCycleIdToFy look like this: 'POM 2017'
    const shortFy = fullFy - 2000;
    const sequentialNumber = ('000' + ufr.requestNumber).slice(-3);
    return shortFy + sequentialNumber;
  }

}
