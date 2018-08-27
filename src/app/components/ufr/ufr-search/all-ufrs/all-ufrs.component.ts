import { ProgramTreeUtils } from './../../../../utils/program-tree-utils';
import { UserUtils } from './../../../../services/user.utils.service';
import { FilterUfrsComponent } from './../filter-ufrs/filter-ufrs.component';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
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
  private matTableDataSource: MatTableDataSource<UFR> = new MatTableDataSource<UFR>();

  @Input() private filterUfrsComponent: FilterUfrsComponent;
  @Input() private mapCycleIdToFy: Map<string, string>;
  
  private mapProgramIdToName: Map<string, string> = new Map<string, string>();// mrid, fullname

  private user: User;

  constructor(private ufrsService: UFRsService,
              private userUtils: UserUtils,
              private programsService: ProgramsService,
              private router: Router) {}

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();
    const programs: Program[] = (await this.programsService.getAll().toPromise()).result;
    this.initProgramIdToName(programs);
    this.search();
  }

  private initProgramIdToName(programs: Program[]) {
    ProgramTreeUtils.fullnames(programs).forEach((fullname, program) => {
      this.mapProgramIdToName.set(program.id, fullname);
    });
  }

  async search() {
    var ufrFilter: UFRFilter = {};
    if (this.filterUfrsComponent.useCycle) ufrFilter.cycle = this.filterUfrsComponent.selectedCycle.replace(/([0-9]+)/, "20$1");
    if (this.filterUfrsComponent.useDates) {
      ufrFilter.from = this.filterUfrsComponent.fromDate;
      ufrFilter.to = this.filterUfrsComponent.toDate;
    }
    if (this.filterUfrsComponent.useDisposition) ufrFilter.disposition = this.filterUfrsComponent.selectedDisposition.toUpperCase().replace( ' ', '_' );
    if (this.filterUfrsComponent.useFunctionalArea) ufrFilter.fa = this.filterUfrsComponent.selectedFunctionalArea;
    if (this.filterUfrsComponent.useOrganization) ufrFilter.orgId = this.filterUfrsComponent.selectedOrganizationId;
    if (this.filterUfrsComponent.useStatus) ufrFilter.status = this.filterUfrsComponent.selectedStatus;

    this.matTableDataSource.data = (await this.ufrsService.search( this.user.currentCommunityId, ufrFilter ).toPromise()).result;
    // FIXME: I think these lines belong in ngAfterViewInit, but I can't get
    // it to work there. The sorter and paginator aren't set there (?)
    // so this is a not-too-ugly workaround.
    this.matTableDataSource.sort = this.sorter;
    this.matTableDataSource.paginator = this.paginator;
  }

  navigate(row) {
    this.router.navigate(['/ufr-view', row.id]);
  }

  getProgramName(ufr: UFR): string {
    return this.mapProgramIdToName.get( ufr.originalMrId );
  }

  getParentProgramName(ufr: UFR): string {
    return (ufr.parentMrId ? this.mapProgramIdToName.get(ufr.parentMrId) : '');
  }

  // Only considers the immediate parent, i.e. cannot consider three levels in the hierarchy, i.e. AAA/BBB/CCC
  getFullProgramName(ufr: UFR): string {
    var parentName = this.getParentProgramName(ufr);
    if (parentName) parentName += '/';

    // this UFR might be a new program, and if so, just use the shortname
    if (ufr.originalMrId) {
      return parentName + this.getProgramName(ufr);
    }

    return parentName + (!ufr.shortName ? '??' : ufr.shortName);
  }

  ufrNumber(ufr: UFR): string {
    const fullFy = +this.mapCycleIdToFy.get(ufr.phaseId).slice(-4); // the value stored in this.mapCycleIdToFy look like this: 'POM 2017'
    const shortFy = fullFy - 2000;
    const sequentialNumber = ('000' + ufr.requestNumber).slice(-3);
    return shortFy + sequentialNumber;
  }

}
