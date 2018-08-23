import { FilterUfrsComponent } from './filter-ufrs/filter-ufrs.component';
import { UserUtils } from './../../../services/user.utils.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { forkJoin } from "rxjs/observable/forkJoin";
import { HeaderComponent } from '../../header/header.component';
import { POMService, PBService, Pom, PB, ProgramsService, User, Program, RestResult, UFRsService, UFR, UFRFilter } from '../../../generated';
import { ProgramTreeUtils } from '../../../utils/program-tree-utils'
import { Cycle } from '../cycle';

@Component({
  selector: 'app-ufr-search',
  templateUrl: './ufr-search.component.html',
  styleUrls: ['./ufr-search.component.scss']
})
export class UfrSearchComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sorter: MatSort;
  @ViewChild(FilterUfrsComponent) filterUfrsComponent: FilterUfrsComponent;
  
  private user: User;

  private cycles: string[] = [];

  private ufrFilter: UFRFilter = {};
  private cyclelkp: Map<string, string> = new Map<string, string>();

  private matTableDataSource: MatTableDataSource<UFR> = new MatTableDataSource<UFR>();
  private mapIdToName: Map<string, string> = new Map<string, string>();// mrid, fullname
  private editable: boolean = false;

  constructor(private ufrsService: UFRsService, 
              private userUtils: UserUtils,
              private pomService: POMService, 
              private pbService: PBService,
              private programsService: ProgramsService,
              private router: Router) {}

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();

    const forkJoinResult: RestResult[] = await forkJoin([
      this.pomService.getByCommunityId(this.user.currentCommunityId),
      this.pbService.getByCommunityId(this.user.currentCommunityId),
      this.programsService.getAll()
    ]).toPromise();
      
    this.initProgramLkp(forkJoinResult[2].result);

    this.editable = false; // this.initCycles() changes it
    this.initCycles(forkJoinResult[0].result, forkJoinResult[1].result);
    
    this.search();
  }

  private initCycles(poms: Pom[], pbs: PB[]) {
    const phases: Cycle[] = [];

    poms.forEach((pom: Pom) => {
      phases.push({ fy: pom.fy, phase: 'POM' });
      this.cyclelkp.set(pom.id, 'POM ' + pom.fy);
      if ('CREATED' === pom.status || 'OPEN' === pom.status) {
        this.editable = true;
      }
    });

    pbs.forEach((pb: PB) => {
      phases.push({ fy: pb.fy, phase: 'PB' });
    });

    phases.sort((cycle1: Cycle, cycle2: Cycle) => {
      if (cycle1.fy === cycle2.fy) {
        if (cycle1.phase === cycle2.phase) {
          return 0;
        }
        return (cycle1.phase < cycle2.phase ? -1 : 1);
      }
      else {
        return cycle1.fy - cycle2.fy;
      }
    });
    phases.forEach((cycle: Cycle) => {
      this.cycles.push(cycle.phase + ' ' + (cycle.fy - 2000));
    });
  }

  private initProgramLkp(programs: Program[]) {
    ProgramTreeUtils.fullnames(programs).forEach((fullname, program) => {
      this.mapIdToName.set(program.id, fullname);
    });
  }

  async search() {
    var ufrFilter: UFRFilter = {};
    if (this.filterUfrsComponent.useCycle) ufrFilter.cycle = this.ufrFilter.cycle.replace(/([0-9]+)/, "20$1");
    if (this.filterUfrsComponent.useDates) {
      ufrFilter.from = this.ufrFilter.from;
      ufrFilter.to = this.ufrFilter.to;
    }
    if (this.filterUfrsComponent.useDisposition) ufrFilter.disposition = this.ufrFilter.disposition.toUpperCase().replace( ' ', '_' );
    if (this.filterUfrsComponent.useFunctionalArea) ufrFilter.fa = this.ufrFilter.fa;
    if (this.filterUfrsComponent.useOrganization) ufrFilter.orgId = this.ufrFilter.orgId;
    if (this.filterUfrsComponent.useStatus) ufrFilter.status = this.ufrFilter.status;

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
    return this.mapIdToName.get( ufr.originalMrId );
  }

  getParentProgramName(ufr: UFR): string {
    return (ufr.parentMrId ? this.mapIdToName.get(ufr.parentMrId) : '');
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
}
