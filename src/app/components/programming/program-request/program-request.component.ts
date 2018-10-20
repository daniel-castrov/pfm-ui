import {ProgramTabComponent} from './program-tab/program-tab.component';
import {PRUtils} from '../../../services/pr.utils.service';
import {ProgramRequestWithFullName, ProgramWithFullName} from '../../../services/with-full-name.service';
import {ProgrammaticRequestState} from '../../../generated/model/programmaticRequestState';
import {CreationTimeType} from '../../../generated/model/creationTimeType';
import {ProgramType} from '../../../generated/model/programType';
import {IdAndNameComponent} from './id-and-name/id-and-name.component';
import {ProgrammaticRequest} from '../../../generated/model/programmaticRequest';
import {PRService} from '../../../generated/api/pR.service';
import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ProgramRequestPageModeService} from './page-mode.service';
import {FundsTabComponent} from "./funds-tab/funds-tab.component";
import {VariantsTabComponent} from "./variants-tab/variants-tab.component";
import {Organization, OrganizationService, User} from '../../../generated';
import {Notify} from "../../../utils/Notify";
import {UserUtils} from '../../../services/user.utils';
import {TagsService, TagType} from "../../../services/tags.service";
import {NewProgramService} from "../../../services/new.program.service";

@Component({
  selector: 'program-request',
  templateUrl: './program-request.component.html',
  styleUrls: ['./program-request.component.scss']
})
export class ProgramRequestComponent implements OnInit, AfterViewInit {

  private pr: ProgrammaticRequest = {};
  private prs: ProgrammaticRequest[];
  @ViewChild(IdAndNameComponent) private idAndNameComponent: IdAndNameComponent;
  @ViewChild(ProgramTabComponent) private programTabComponent: ProgramTabComponent;
  @ViewChild(FundsTabComponent) private fundsTabComponent: FundsTabComponent;
  @ViewChild(VariantsTabComponent) private variantsTabComponent: VariantsTabComponent;

  constructor( private prService: PRService,
               private userUtils: UserUtils,
               private programRequestPageMode: ProgramRequestPageModeService,
               private changeDetectorRef: ChangeDetectorRef,
               private orgService: OrganizationService,
               private newProgramService: NewProgramService ) {
    this.pr.fundingLines = [];
  }

  async ngOnInit() {
    await this.initPr();
    this.idAndNameComponent.init(this.pr);
    this.prs = (await this.prService.getByPhase(this.pr.phaseId).toPromise()).result;
  }

  ngAfterViewInit() {
    this.changeDetectorRef.detectChanges()
  }

  private async initPr() {
    if (this.programRequestPageMode.prId) { // PR is in edit mode
      this.pr = (await this.prService.getById(this.programRequestPageMode.prId).toPromise()).result;
    } else { // PR is in create mode
      this.initPrFields();
      if (!this.pr.leadComponent) {
        var user: User = await this.userUtils.user().toPromise();
        var organization: Organization = (await this.orgService.getById(user.organizationId).toPromise()).result;
        this.pr.leadComponent = organization.abbreviation;
      }
    }
  }

  private initPrFields() {
    this.pr.phaseId = this.programRequestPageMode.phaseId;
    this.pr.creationTimeType = this.programRequestPageMode.type;
    this.pr.bulkOrigin = false;
    this.pr.state = 'SAVED';

    switch (this.programRequestPageMode.type) {
      case CreationTimeType.PROGRAM_OF_MRDB:
        this.pr.originalMrId = this.programRequestPageMode.reference.id;
        this.pr.creationTimeReferenceId = this.programRequestPageMode.reference.id;
        this.pr.type = this.programRequestPageMode.programType;
        this.pr.longName = this.programRequestPageMode.reference.longName;
        this.pr.shortName = this.programRequestPageMode.reference.shortName;
        this.initPrWith(this.programRequestPageMode.reference);
        break;
      case CreationTimeType.SUBPROGRAM_OF_MRDB:
        this.initPrWith(this.programRequestPageMode.reference);
        this.pr.type = this.programRequestPageMode.programType;
        this.pr.creationTimeReferenceId = this.programRequestPageMode.reference.id;
        break;
      case CreationTimeType.SUBPROGRAM_OF_PR:
        this.pr.type = this.programRequestPageMode.programType;
        this.pr.creationTimeReferenceId = this.programRequestPageMode.reference.id;
        this.initPrWith(this.programRequestPageMode.reference);
        break;
      case CreationTimeType.NEW_PROGRAM:
        this.pr.type = this.programRequestPageMode.programType;
        this.newProgramService.initRequiredFieldsWithSomeValues(this.pr);
        break;
      default:
        console.log('Wrong programRequestPageMode.type');
    }
  }

  initPrWith(programOrPR: ProgramWithFullName | ProgramRequestWithFullName) {
    this.pr.acquisitionType = programOrPR.acquisitionType;
    this.pr.bsvStrategy = programOrPR.bsvStrategy;
    this.pr.commodityArea = programOrPR.commodityArea;
    this.pr.coreCapability = programOrPR.coreCapability;
    this.pr.description = programOrPR.description;
    this.pr.emphases = programOrPR.emphases.slice();
    this.pr.functionalArea = programOrPR.functionalArea;
    this.pr.leadComponent = programOrPR.leadComponent;
    this.pr.manager = programOrPR.manager;
    this.pr.medicalArea = programOrPR.medicalArea;
    this.pr.nbcCategory = programOrPR.nbcCategory;
    this.pr.primaryCapability = programOrPR.primaryCapability;
    this.pr.secondaryCapability = programOrPR.secondaryCapability;
    this.pr.emphases = [...programOrPR.emphases];
  }

  async save(state: ProgrammaticRequestState) {
    let fundsTabValidation = this.fundsTabComponent.validate;
    if(!fundsTabValidation.isValid){
      Notify.error(fundsTabValidation.message);
    } else {
      if(this.pr.id) {
        this.pr.state = state;
        this.pr = (await this.prService.save(this.pr.id, this.pr).toPromise()).result;
        if (this.pr.state === ProgrammaticRequestState.SAVED) {
          Notify.success('Program request saved successfully')
        } else {
          Notify.success('Program request submitted successfully')
        }
      } else {
        this.pr = (await this.prService.create(this.pr).toPromise()).result;
        Notify.success('Program request created successfully')
      }
    }
  }

  isNotSavable(): boolean {
    if(!this.idAndNameComponent) return true; // not fully initilized yet
    if(this.variantsTabComponent.invalid) return true;
    return this.idAndNameComponent.invalid || this.pr.state == ProgrammaticRequestState.SUBMITTED;
  }

  isNotSubmittable(): boolean {
    if( !this.prs || !this.idAndNameComponent || !this.programTabComponent ) return true // not fully initilized yet
    if( this.pr.type == ProgramType.GENERIC ) return true;
    if( this.thereAreOutstandingGenericSubprogramsAmongTheChildren() ) return true;
    if(this.variantsTabComponent.invalid) return true;
    return this.idAndNameComponent.invalid || this.programTabComponent.invalid || this.pr.state == ProgrammaticRequestState.SUBMITTED;
  }

  private thereAreOutstandingGenericSubprogramsAmongTheChildren(): boolean {
    return !!PRUtils.findGenericSubprogramChildren(this.pr.id, this.prs).find(pr => this.pr.state === 'OUTSTANDING');
  }

}
