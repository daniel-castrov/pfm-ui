import {Component, OnInit, ViewChild} from '@angular/core';
import {
  Execution,
  ExecutionService,
  OrganizationService,
  Pom,
  POMService,
  Program,
  ShortyType,
  UFR,
  UFRsService,
  UfrStatus
} from '../../../generated';
import {ActivatedRoute} from '@angular/router';
import {PRUtils} from '../../../services/pr.utils.service';
import {ProgramAndPrService} from "../../../services/program-and-pr.service";
import {UfrUfrTabComponent} from "./ufr-ufr-tab/ufr-ufr-tab.component";
import {UfrProgramComponent} from "./ufr-program-tab/ufr-program-tab.component";
import {UfrFundsComponent} from "./ufr-funds-tab/ufr-funds-tab.component";
import {Notify} from "../../../utils/Notify";
import {UfrJustificationComponent} from "./ufr-justification-tab/ufr-justification-tab.component";
import {CurrentPhase} from "../../../services/current-phase.service";
import {PhaseType} from "../../programming/select-program-request/UiProgramRequest";

@Component({
  selector: 'app-ufr-view',
  templateUrl: './ufr-view.component.html',
  styleUrls: ['./ufr-view.component.scss']
})
export class UfrViewComponent implements OnInit {
  @ViewChild(UfrUfrTabComponent) ufrUfrTabComponent: UfrUfrTabComponent;
  @ViewChild(UfrFundsComponent) ufrFundsComponent: UfrFundsComponent;
  @ViewChild(UfrProgramComponent) ufrProgramComponent: UfrProgramComponent;
  @ViewChild(UfrJustificationComponent) ufrJustificationComponent: UfrJustificationComponent;
  private ufr: UFR;
  private canedit: boolean = false;
  private pom: Pom;
  private execution: Execution;
  private fy: number;
  private shorty: Program;
  phaseType: PhaseType;

  constructor( private ufrService: UFRsService,
               private currentPhase: CurrentPhase,
               private route: ActivatedRoute,
               private pomService: POMService,
               private executionService: ExecutionService,
               private orgService: OrganizationService,
               private programAndPrService : ProgramAndPrService ) {}

  async ngOnInit() {
    let ufrId = this.route.snapshot.params['id'];
    if(ufrId) {
      this.ufr = (await this.ufrService.getUfrById(ufrId).toPromise()).result;
    } else {
      const serializedUfr = sessionStorage.getItem('ufr');
      this.ufr = JSON.parse(serializedUfr);
    }

    this.phaseType = <PhaseType>PhaseType[this.route.snapshot.params['phaseType'].toUpperCase()];
    this.init();
    this.canedit = !!await this.currentPhase.pom().toPromise();
  }

  private async init() {
    if(this.phaseType === PhaseType.EXE){
      this.execution = (await this.executionService.getById(this.ufr.containerId).toPromise()).result;
      this.fy = this.execution.fy;

    } else {
      this.pom = (await this.pomService.getByWorkspaceId(this.ufr.containerId).toPromise()).result;
      this.fy = this.pom.fy;
    }
    this.initShorty();
  }

  async initShorty() {
    if( this.ufr.shortyType == ShortyType.MRDB_PROGRAM ||
        this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM ||
        this.ufr.shortyType == ShortyType.NEW_FOS_FOR_MRDB_PROGRAM ) {
      this.shorty = await this.programAndPrService.program(this.ufr.shortyId);
    } else if( this.ufr.shortyType == ShortyType.PR ||
               this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_PR ||
               this.ufr.shortyType == ShortyType.NEW_FOS_FOR_PR ) {
      this.shorty = await this.programAndPrService.programRequest(this.pom.workspaceId, this.ufr.shortyId);
    } else { // this.ufr.shortyType == ShortyType.NEW_PROGRAM
      // leave this.shorty null
    }
  }

  async save() {
    if (this.phaseType === PhaseType.EXE) {
      this.ufr.yoE = true;
    }
    this.ufr.organizationId = (await this.orgService.getByAbbreviation(
      PRUtils.getOrganizationNameForLeadComponent(this.ufr.leadComponent) ).toPromise()).result.id;

    let fundsTabValidation = this.ufrFundsComponent.validate;
    let justificationTabValidation = this.ufrJustificationComponent.validate;
    if (justificationTabValidation) {
      Notify.error(justificationTabValidation.message);
      this.ufr.ufrStatus = UfrStatus.SAVED;
    } else {
      if(!fundsTabValidation.isValid){
        Notify.error(fundsTabValidation.message);
      } else {
        if(this.ufr.id) {
          this.ufrService.update(this.ufr).subscribe(d => {
            if (d.error) {
              Notify.error(d.error);
            }
            else {
              if (this.ufr.ufrStatus === UfrStatus.SUBMITTED) {
                Notify.success('UFR submitted successfully');
              } else {
                Notify.success('UFR saved successfully');
              }
            }
          });
        } else {
          if (this.ufr.ufrStatus === UfrStatus.SUBMITTED) {
            // going straight to SUBMIT without a SAVE first (so save first!)
            this.ufrService.create(this.ufr).subscribe(d => {
              if (d.error) {
                Notify.error(d.error);
              }
              else {
                this.ufr = d.result;
                this.ufr.ufrStatus = UfrStatus.SUBMITTED;
                this.save();
              }
            });
          }
          else {
            this.ufr = (await this.ufrService.create(this.ufr).toPromise()).result;
            Notify.success('UFR created successfully')
          }
        }
      }
    }
  }

  submit() {
    this.ufr.ufrStatus = UfrStatus.SUBMITTED;
    this.save();
  }

  get ufrNumber(): string {
    if(this.ufr.requestNumber) {
      const sequentialNumber = ('000' + this.ufr.requestNumber).slice(-3);
      return 'number ' + (this.fy - 2000) + sequentialNumber;
    } else {
      return '';
    }
  }

  isNotSavable(): boolean {
    if(this.ufrUfrTabComponent && this.ufrUfrTabComponent.invalid()) return true;
    if(this.ufrProgramComponent && this.ufrProgramComponent.invalid()) return true;
    return this.ufr.ufrStatus == UfrStatus.SUBMITTED
      || this.ufr.ufrStatus == UfrStatus.VALID
      || this.ufr.ufrStatus == UfrStatus.INVALID
      || this.ufr.ufrStatus == UfrStatus.WITHDRAWN
      || this.ufr.ufrStatus == UfrStatus.ARCHIVED;
  }

  isNotSubmittable(): boolean {
    if(this.ufrUfrTabComponent && this.ufrUfrTabComponent.invalid()) return true;
    if(this.ufrProgramComponent && this.ufrProgramComponent.invalid()) return true;
    if(this.ufrFundsComponent && this.ufrFundsComponent.invalid()) return true;
    return this.ufr.ufrStatus == UfrStatus.SUBMITTED
      || this.ufr.ufrStatus == UfrStatus.VALID
      || this.ufr.ufrStatus == UfrStatus.INVALID
      || this.ufr.ufrStatus == UfrStatus.WITHDRAWN
      || this.ufr.ufrStatus == UfrStatus.ARCHIVED;
  }

  readonly(): boolean {
    return this.ufr.ufrStatus == UfrStatus.SUBMITTED
      || this.ufr.ufrStatus == UfrStatus.VALID
      || this.ufr.ufrStatus == UfrStatus.INVALID
      || this.ufr.ufrStatus == UfrStatus.WITHDRAWN
      || this.ufr.ufrStatus == UfrStatus.ARCHIVED;
  }

  ufrType(): string {
    if(this.ufr.shortyType == ShortyType.MRDB_PROGRAM) return ` ${this.shorty ? this.shorty.shortName : ''} program`;
    if(this.ufr.shortyType == ShortyType.PR) return " a program request";
    if(this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM || this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_PR) return " a new increment";
    if(this.ufr.shortyType == ShortyType.NEW_FOS_FOR_MRDB_PROGRAM || this.ufr.shortyType == ShortyType.NEW_FOS_FOR_PR) return " a new FoS";
    if(this.ufr.shortyType == ShortyType.NEW_PROGRAM) return " a new program";
  }

}

