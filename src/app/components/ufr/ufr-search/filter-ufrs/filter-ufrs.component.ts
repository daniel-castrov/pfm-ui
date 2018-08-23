import { UserUtils } from './../../../../services/user.utils.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { forkJoin } from "rxjs/observable/forkJoin";
import { OrganizationService, Organization, ProgramsService, Tag, User, RestResult, UFRFilter } from '../../../../generated';
import { Disposition } from '../../disposition.enum';
import { Status } from '../../status.enum';

@Component({
  selector: 'filter-ufrs',
  templateUrl: './filter-ufrs.component.html',
  styleUrls: ['./filter-ufrs.component.scss']
})
export class FilterUfrsComponent implements OnInit {
  @Input() private ufrFilter: UFRFilter;
  @Output() private change: EventEmitter<any> = new EventEmitter();
  
  private user: User;
  
  public useOrganization: boolean = false;
  private organizations: Organization[] = [];
  
  public useFunctionalArea: boolean = false;
  private functionalAreas: Tag[] = [];
  
  public useDates: boolean = false;
  
  public useStatus: boolean = false;
  private statuses: string[] = [];
  
  public useDisposition: boolean = false;
  private dispositions: string[]=[];
  
  public useCycle: boolean = false;
  @Input() private cycles: string[];
  @Input() private cyclelkp: Map<string, string>;
  
  constructor(private userUtils: UserUtils,
              private organizationService: OrganizationService,
              private programsService: ProgramsService) {
    this.dispositions = Object.keys(Disposition).filter(k => typeof Disposition[k] === "number") as string[];
    this.statuses = Object.keys(Status).filter(k => typeof Status[k] === "number") as string[];
  }

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();

    const forkJoinResult: RestResult[] = await forkJoin([
      this.organizationService.getByCommunityId(this.user.currentCommunityId),
      this.programsService.getTagsByType("Functional Area"),
    ]).toPromise();
      
    this.organizations = forkJoinResult[0].result;
    this.functionalAreas = forkJoinResult[1].result || [];

    this.functionalAreas.sort((tag1: Tag, tag2: Tag) => { 
      if (tag1.abbr === tag2.abbr) {
        return 0;
      }
      return (tag1.abbr < tag2.abbr ? -1 : 1);
    });
    
    this.initUfrFilter();

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

}
