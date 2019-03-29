import {ProgramTabComponent} from './program-tab/program-tab.component';
import {PRUtils} from '../../../services/pr.utils.service';
import {ProgramStatus} from '../../../generated/model/programStatus';
import {ProgramType} from '../../../generated/model/programType';
import {IdAndNameComponent} from './id-and-name/id-and-name.component';
import {Program} from '../../../generated/model/program';
import {PRService} from '../../../generated/api/pR.service';
import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {AddNewPrForMode, ProgramRequestPageModeService} from './page-mode.service';
import {FundsTabComponent} from "./funds-tab/funds-tab.component";
import {VariantsTabComponent} from "./variants-tab/variants-tab.component";
import {
  Organization,
  OrganizationService,
  Pom,
  POMService,
  RestResult,
  RolesPermissionsService,
  User
} from '../../../generated';
import {Notify} from "../../../utils/Notify";
import {UserUtils} from '../../../services/user.utils';
import {Validation} from './funds-tab/Validation';

@Component({
  selector: 'program-request',
  templateUrl: './program-request.component.html',
  styleUrls: ['./program-request.component.scss']
})
export class ProgramRequestComponent implements OnInit, AfterViewInit {

  public pr: Program = {};
  public prs: Program[];
  public pom: Pom;
  private ismgr: boolean;
  @ViewChild(IdAndNameComponent) private idAndNameComponent: IdAndNameComponent;
  @ViewChild(ProgramTabComponent) private programTabComponent: ProgramTabComponent;
  @ViewChild(FundsTabComponent) private fundsTabComponent: FundsTabComponent;
  @ViewChild(VariantsTabComponent) private variantsTabComponent: VariantsTabComponent;

  constructor( private prService: PRService,
               private userUtils: UserUtils,
               public programRequestPageMode: ProgramRequestPageModeService,
               private changeDetectorRef: ChangeDetectorRef,
               private orgService: OrganizationService,
               private pomService:POMService,
               private rolesvc: RolesPermissionsService ) {
    this.pr.fundingLines = [];
  }

  async ngOnInit() {
    await this.initPr();
    this.pom = (await this.pomService.getByWorkspaceId(this.pr.containerId).toPromise()).result;
    this.prs = (await this.prService.getByContainer(this.pr.containerId).toPromise()).result;

    this.ismgr = false;
    this.rolesvc.getRoles().subscribe(data => {
      this.ismgr = (data.result.includes('POM_Manager'));
    });
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
    this.pr.containerId = this.programRequestPageMode.phaseId;
    this.pr.bulkOrigin = false;
    this.pr.programStatus = 'SAVED';

    switch (this.programRequestPageMode.type) {
      case AddNewPrForMode.AN_MRDB_PROGRAM:
        this.pr.type = this.programRequestPageMode.programType;
        this.pr.longName = this.programRequestPageMode.reference.longName;
        this.pr.shortName = this.programRequestPageMode.reference.shortName;
        this.initPrWith(this.programRequestPageMode.reference);
        break;
      case AddNewPrForMode.A_NEW_INCREMENT:
      case AddNewPrForMode.A_NEW_FOS:
      case AddNewPrForMode.A_NEW_SUBPROGRAM:
        this.initPrWith(this.programRequestPageMode.reference);
        this.pr.shortName = this.programRequestPageMode.reference.shortName + "/";
        this.pr.type = this.programRequestPageMode.programType;
        break;
      case AddNewPrForMode.A_NEW_PROGRAM:
        this.pr.shortName = "";
        this.pr.type = this.programRequestPageMode.programType;
        break;
      default:
        console.log('Wrong programRequestPageMode.type');
    }
  }

  initPrWith(programOrPR: Program) {
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
    this.pr.organizationId = programOrPR.organizationId;
  }

  async save(programStatus: ProgramStatus) {

    this.pr.organizationId = (await this.orgService.getByAbbreviation(
      PRUtils.getOrganizationNameForLeadComponent(this.pr.leadComponent) ).toPromise()).result.id;

    // if we're trying to SAVE a GENERIC program during RECONCILIATION, we need to SUBMIT it instead
    if (Pom.StatusEnum.RECONCILIATION == this.pom.status &&
      ProgramType.GENERIC === this.pr.type && 
      ProgramStatus.SAVED === programStatus) {
        programStatus = ProgramStatus.SUBMITTED;
    }

    let fundsTabValidation = this.fundsTabComponent.validate;
    if(!fundsTabValidation.isValid){
      Notify.error(fundsTabValidation.message);
    } else {
      if(this.pr.id) {
        let oldStatus = this.pr.programStatus;
        this.pr.programStatus = programStatus;
        let data:RestResult = (await this.prService.save(this.pr.id, this.pr).toPromise());
        if (data.error) {
          this.pr.programStatus = oldStatus;
          Notify.error('Program request failed to save.\n' + data.error);
        } else {
          if (this.pr.programStatus === ProgramStatus.SAVED) {
            Notify.success('Program request saved successfully')
          } else {
            Notify.success('Program request submitted successfully')
          }
          this.pr = data.result;
        }
      } else {
        this.pr = (await this.prService.create(this.pr).toPromise()).result;
        Notify.success('Program request created successfully')
      }
    }
  }

  isNotSavable(): boolean {
    if(!this.idAndNameComponent) return true; // not fully initilized yet
    if (this.variantsTabComponent.invalid) return true;
    
    // if we're in RECONCILIATION mode, we can always save a subprogram
    if (this.pom && Pom.StatusEnum.RECONCILIATION == this.pom.status &&
      this.pr.type == ProgramType.GENERIC) {
      var validation: Validation = this.fundsTabComponent.validate;
      return (!validation.isValid || this.idAndNameComponent.invalid || this.programTabComponent.invalid);
    }

    return this.idAndNameComponent.invalid || this.programTabComponent.invalid || this.pr.programStatus == ProgramStatus.SUBMITTED;
  }

  isNotSubmittable(): boolean {
    if( !this.prs || !this.idAndNameComponent || !this.programTabComponent ) return true // not fully initilized yet
    if( this.pr.type == ProgramType.GENERIC ) return true;
    if( this.thereAreOutstandingGenericSubprogramsAmongTheChildren() ) return true;
    if (this.variantsTabComponent.invalid) return true;

    if (!this.pr.bulkOrigin) { // if we're creating a new PR, check for funding
      if (!this.fundsTabComponent.flHaveValues()) return true;
    }

    // check if we're the POM_Manager, and have funds edits
    // POM_Manager can always submit edited values
    if (this.ismgr && this.fundsTabComponent.hasEditedValues()) {
      return false;
    }

    return this.idAndNameComponent.invalid || this.programTabComponent.invalid || this.pr.programStatus == ProgramStatus.SUBMITTED;
  }

  private thereAreOutstandingGenericSubprogramsAmongTheChildren(): boolean {
    return !!PRUtils.findGenericSubprogramChildren(this.pr, this.prs).find(pr => this.pr.programStatus === 'OUTSTANDING');
  }

}
