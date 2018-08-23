import { RestResult } from './../../../generated/model/restResult';
import { UserUtils } from './../../../services/user.utils.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { forkJoin } from "rxjs/observable/forkJoin";
import { HeaderComponent } from '../../header/header.component';
import { UFRsService } from '../../../generated/api/uFRs.service';
import { UFR } from '../../../generated/model/uFR'
import { CommunityService } from '../../../generated/api/community.service';
import { UFRFilter } from '../../../generated/model/uFRFilter';
import { OrganizationService, Organization, POMService, PBService, Pom, PB, ProgramsService, Tag, User, Program } from '../../../generated';
import { ProgramTreeUtils } from '../../../utils/program-tree-utils'
import { Cycle } from '../cycle';
import { Disposition } from '../disposition.enum';
import { Status } from '../status.enum';

@Component({
  selector: 'app-ufr-search',
  templateUrl: './ufr-search.component.html',
  styleUrls: ['./ufr-search.component.scss']
})
export class UfrSearchComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sorter: MatSort;

  private user: User;

  private useOrganization: boolean = false;
  private organizations: Organization[] = [];

  private useFunctionalArea: boolean = false;
  private functionalAreas: Tag[] = [];

  private useDates: boolean = false;

  private useStatus: boolean = false;
  private statuses: string[] = [];
  
  private useDisposition: boolean = false;
  private dispositions: string[]=[];

  private useCycle: boolean = false;
  private cycles: string[] = [];

  private ufrFilter: UFRFilter = {};
  private cyclelkp: Map<string, string> = new Map<string, string>();

  private datasource: MatTableDataSource<UFR> = new MatTableDataSource<UFR>();
  private mapIdToName: Map<string, string> = new Map<string, string>();// mrid, fullname
  private editable: boolean = false;

  constructor(private ufrsService: UFRsService, 
              private userUtils: UserUtils,
              private communityService: CommunityService, 
              private organizationService: OrganizationService,
              private pomService: POMService, 
              private pbService: PBService,
              private programsService: ProgramsService,
              private router: Router) {
    this.dispositions = Object.keys(Disposition).filter(k => typeof Disposition[k] === "number") as string[];
    this.statuses = Object.keys(Status).filter(k => typeof Status[k] === "number") as string[];
  }

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();

    const forkJoinResult: RestResult[] = await forkJoin([
      this.organizationService.getByCommunityId(this.user.currentCommunityId), // 1
      this.pomService.getByCommunityId(this.user.currentCommunityId), // 2
      this.pbService.getByCommunityId(this.user.currentCommunityId), // 3
      this.programsService.getTagsByType("Functional Area"), // 4
      this.programsService.getAll() // 5
    ]).toPromise();
      
    this.organizations = forkJoinResult[0].result;
    this.functionalAreas = forkJoinResult[3].result || [];

    this.initProgramLkp(forkJoinResult[4].result);

    
    this.functionalAreas.sort((tag1: Tag, tag2: Tag) => { 
      if (tag1.abbr === tag2.abbr) {
        return 0;
      }
      return (tag1.abbr < tag2.abbr ? -1 : 1);
    });
    
    this.editable = false; // this.initCycles() changes it
    this.initCycles(forkJoinResult[1].result, forkJoinResult[2].result);
    
    this.initUfrFilter();
    
    this.search();
  }


  private initUfrFilter() {
    this.ufrFilter.orgId = this.organizations[0].id;
    this.ufrFilter.from = new Date().getTime();
    this.ufrFilter.to = new Date().getTime();
    this.ufrFilter.status = Status[0];
    this.ufrFilter.disposition = Disposition[0];
    this.ufrFilter.cycle = this.cycles[0];
    this.ufrFilter.fa = this.functionalAreas[0].abbr;
    this.ufrFilter.yoe = true;
    this.ufrFilter.active = true;
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

  search() {
    var searchfilter: UFRFilter = {};
    if (this.useCycle) searchfilter.cycle = this.ufrFilter.cycle.replace(/([0-9]+)/, "20$1");
    if (this.useDates) {
      searchfilter.from = this.ufrFilter.from;
      searchfilter.to = this.ufrFilter.to;
    }
    if (this.useDisposition) searchfilter.disposition = this.ufrFilter.disposition.toUpperCase().replace( ' ', '_' );
    if (this.useFunctionalArea) searchfilter.fa = this.ufrFilter.fa;
    if (this.useOrganization) searchfilter.orgId = this.ufrFilter.orgId;
    if (this.useStatus) searchfilter.status = this.ufrFilter.status;

    this.ufrsService.search( this.user.currentCommunityId, searchfilter ).subscribe(
      (data) => {
        this.datasource.data = data.result;
        // FIXME: I think these lines belong in ngAfterViewInit, but I can't get
        // it to work there. The sorter and paginator aren't set there (?)
        // so this is a not-too-ugly workaround.
        this.datasource.sort = this.sorter;
        this.datasource.paginator = this.paginator;
      });
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

    return parentName + (!ufr.shortName || null === ufr.shortName ? '??' : ufr.shortName);
  }
}
