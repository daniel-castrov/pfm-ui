import { Component, OnInit, ViewChild, Input, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource, MatPaginator, MatSort, MatSortable } from '@angular/material';
import { forkJoin } from "rxjs/observable/forkJoin";

import { HeaderComponent } from '../../../components/header/header.component';

import { UFRsService } from '../../../generated/api/uFRs.service';
import { UFR } from '../../../generated/model/uFR'
import { MyDetailsService } from '../../../generated/api/myDetails.service';
import { CommunityService } from '../../../generated/api/community.service';
import { UFRFilter } from '../../../generated/model/uFRFilter';
import {
  OrganizationService, Organization, Community, POMService, PBService,
  Pom, PB, ProgramsService, Tag, Program
} from '../../../generated';

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

  private year: number = new Date().getFullYear() + 2;
  private useorg: boolean = false;
  private usefa: boolean = false;
  private usedates: boolean = false;
  private usestatus: boolean = false;
  private usedisp: boolean = false;
  private usecycle: boolean = false;
  private filter: UFRFilter = {};
  private orgs: Organization[] = [];
  private fas: Tag[] = [];
  private cycles: string[] = [];
  private community: Community;
  private dispositions: string[]=[];
  private statuses: string[] = [];
  private cyclelkp: Map<string, string> = new Map<string, string>();

  private datasource: MatTableDataSource<UFR> = new MatTableDataSource<UFR>();
  private programlkp: Map<string, string> = new Map<string, string>();// mrid, fullname
  private editable: boolean = false;

  constructor(private usvc: UFRsService, private userDetailsService: MyDetailsService,
    private communityService: CommunityService, private orgsvc: OrganizationService,
    private pomsvc: POMService, private pbsvc: PBService, private progsvc: ProgramsService,
    private router: Router) {
    
    this.dispositions = Object.keys(Disposition)
      .filter(k => typeof Disposition[k] === "number") as string[];
    this.statuses = Object.keys(Status)
      .filter(k => typeof Status[k] === "number") as string[];
  }

  ngOnInit() {
    var my: UfrSearchComponent = this;

    this.userDetailsService.getCurrentUser().subscribe((person) => {
      forkJoin([my.communityService.getById(person.result.currentCommunityId),
        my.orgsvc.getByCommunityId(person.result.currentCommunityId),
        my.pomsvc.getByCommunityId(person.result.currentCommunityId),
        my.pbsvc.getById(person.result.currentCommunityId),
        my.progsvc.getTagsByType("Functional Area"),
        my.progsvc.getAll()
      ]).subscribe(data => {
        my.community = data[0].result;
        my.orgs = data[1].result;
        my.fas = (data[4].result ? data[4].result : []);
        
        ProgramTreeUtils.fullnames(data[5].result).forEach((fullname, program) => {
          my.programlkp.set(program.id, fullname);
        });

        // console.log( 'pomisopen: '+my.pomIsOpen)

        my.filter.orgId = my.orgs[0].id;
        my.filter.from = new Date().getTime();
        my.filter.to = new Date().getTime();
        my.filter.status = Status[0];
        my.filter.disposition = Disposition[0];
        
        my.fas.sort(function (a, b) { 
          if (a.abbr === b.abbr) {
            return 0;
          }
          return (a.abbr < b.abbr ? -1 : 1);
        });
        my.filter.fa = my.fas[0].abbr;

        my.filter.yoe = true;
        my.filter.active = true;

        my.editable = false;
        var phases: Cycle[] = [];
        data[2].result.forEach(function (x: Pom) {
          phases.push({
            fy: x.fy,
            phase: 'POM'
          });
          my.cyclelkp.set(x.id, 'POM ' + x.fy);


          if ('CREATED' === x.status || 'OPEN' === x.status) {
            my.editable = true;
          }
        });
        data[3].result.forEach(function (x: PB) {
          phases.push({
            fy: x.fy,
            phase: 'PB'
          });
        });

        phases.sort(function (a:any, b:any) {
          if (a.fy === b.fy) {
            if (a.phase === b.phase) {
              return 0;
            }
            return (a.phase < b.phase ? -1 : 1);
          }
          else {
            return a.fy - b.fy;
          }
        });

        phases.forEach(function (x:any) { 
          my.cycles.push( x.phase + ' ' + (x.fy - 2000));
        });
        my.filter.cycle = my.cycles[0];
        my.search();
      });
    });
  }

  search() {
    var my: UfrSearchComponent = this;
    var searchfilter: UFRFilter = {};
    if (my.usecycle) {
      searchfilter.cycle = my.filter.cycle.replace(/([0-9]+)/, "20$1");
    }
    if (my.usedates) {
      searchfilter.from = my.filter.from;
      searchfilter.to = my.filter.to;
    }
    if (my.usedisp) {
      searchfilter.disposition = my.filter.disposition.toUpperCase().replace( ' ', '_' );
    }
    if (my.usefa) {
      searchfilter.fa = my.filter.fa;
    }
    if (my.useorg) {
      searchfilter.orgId = my.filter.orgId;
    }
    if (my.usestatus) {
      searchfilter.status = my.filter.status;
    }

    //console.log(my.community.id);
    //console.log(searchfilter);
    this.usvc.search( my.community.id, searchfilter ).subscribe(
      (data) => {
        my.datasource.data = data.result;
        //console.log(data.result);
        //my.datasource.data = my.makeMockUfrs();
        // FIXME: I think these lines belong in ngAfterViewInit, but I can't get
        // it to work there. The sorter and paginator aren't set there (?)
        // so this is a not-too-ugly workaround.
        my.datasource.sort = my.sorter;
        my.datasource.paginator = my.paginator;
      });
  }

  navigate(row) {
    this.router.navigate(['/ufr-view', row.id]);
  }

  getProgId(p: UFR) {
    return this.programlkp.get( p.originalMrId );
  }

  getParentProgId(p: UFR) {
    return (p.parentMrId ? this.programlkp.get(p.parentMrId) : '');
  }

  getFullProgId(p: UFR) {
    var parentname = this.getParentProgId(p);
    if ('' != parentname) {
      parentname += '/';
    }

    // this UFR might be a new program, and if so, just use the shortname
    if (p.originalMrId) {
      return parentname + this.getProgId(p);
    }

    return parentname + (!p.shortName || null === p.shortName ? '??' : p.shortName);
  }
}
