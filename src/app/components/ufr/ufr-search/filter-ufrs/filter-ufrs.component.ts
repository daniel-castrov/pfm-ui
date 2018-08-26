import { join } from './../../../../utils/join';
import { UserUtils } from './../../../../services/user.utils.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { forkJoin } from "rxjs/observable/forkJoin";
import { OrganizationService, Organization, ProgramsService, Tag, User, RestResult } from '../../../../generated';
import { Disposition } from '../../disposition.enum';
import { Status } from '../../status.enum';

@Component({
  selector: 'filter-ufrs',
  templateUrl: './filter-ufrs.component.html',
  styleUrls: ['./filter-ufrs.component.scss']
})
export class FilterUfrsComponent implements OnInit {
  @Output() private change: EventEmitter<any> = new EventEmitter();
  
  private user: User;
  
  private organizations: Organization[] = [];
  public useOrganization: boolean = false;
  public selectedOrganizationId: string;
  
  private functionalAreas: Tag[] = [];
  public useFunctionalArea: boolean = false;
  public selectedFunctionalArea: string;
  
  public useDates: boolean = false;
  public fromDate: number;
  public toDate: number;
  
  private statuses: string[] = [];
  public useStatus: boolean = false;
  public selectedStatus: string;
  
  private dispositions: string[]=[];
  public useDisposition: boolean = false;
  public selectedDisposition: string;
  
  public useCycle: boolean = false;
  @Input() private cycles: string[];
  public selectedCycle: string;

  @Input() private mapCycleIdToFy: Map<string, string>;
  
  constructor(private userUtils: UserUtils,
              private organizationService: OrganizationService,
              private programsService: ProgramsService) {
    this.dispositions = Object.keys(Disposition).filter(k => typeof Disposition[k] === "number") as string[];
    this.statuses = Object.keys(Status).filter(k => typeof Status[k] === "number") as string[];
  }

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();

    const [organizations, functionalAreas] = (await join( this.organizationService.getByCommunityId(this.user.currentCommunityId),
                                                          this.programsService.getTagsByType("Functional Area") )) as [Organization[], Tag[]];
  
    this.organizations = organizations;
    this.functionalAreas = functionalAreas || [];

    this.functionalAreas.sort((tag1: Tag, tag2: Tag) => { 
      if (tag1.abbr === tag2.abbr) {
        return 0;
      }
      return (tag1.abbr < tag2.abbr ? -1 : 1);
    });
    
    this.initSelections();
  }

  private initSelections() {
    this.selectedOrganizationId = this.organizations[0].id;
    this.fromDate = new Date().getTime();
    this.toDate = new Date().getTime();
    this.selectedStatus = Status[0];
    this.selectedDisposition = Disposition[0];
    this.selectedCycle = this.cycles[0];
    this.selectedFunctionalArea = this.functionalAreas[0].abbr;
  }

}
