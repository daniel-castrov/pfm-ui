import { join } from './../../../../utils/join';
import { UserUtils } from '../../../../services/user.utils';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OrganizationService, Organization, ProgramsService, Tag, User, UfrStatus, Disposition} from '../../../../generated';

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
  
  private statuses: string[] = Object.keys(UfrStatus);
  public useStatus: boolean = false;
  public selectedStatus: string;
  
  private dispositions: string[] = Object.keys(Disposition);
  public useDisposition: boolean = false;
  public selectedDisposition: string;
  
  public useCycle: boolean = false;
  @Input() private cycles: string[];
  public selectedCycle: string;

  @Input() private mapCycleIdToFy: Map<string, string>;
  
  constructor(private userUtils: UserUtils,
              private organizationService: OrganizationService,
              private programsService: ProgramsService) {}

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
    this.selectedStatus = this.statuses[0];
    this.selectedDisposition = Disposition[0];
    this.selectedCycle = this.cycles[0];
    this.selectedFunctionalArea = this.functionalAreas[0].abbr;
  }

}
