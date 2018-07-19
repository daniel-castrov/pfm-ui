import { ProgramRequestWithFullName, ProgramWithFullName, WithFullNameService } from './../../../services/with-full-name.service';
import { ProgrammaticRequest } from './../../../generated/model/programmaticRequest';
import { PRService } from './../../../generated/api/pR.service';
import { Component, OnInit } from '@angular/core';

// Other Components
import { ProgramRequestPageModeService, Type } from './page-mode.service';


@Component({
  selector: 'program-request',
  templateUrl: './program-request.component.html',
  styleUrls: ['./program-request.component.scss']
})
export class ProgramRequestComponent implements OnInit {

  pr: ProgrammaticRequest = {};
  parentFullName: string;

  constructor( private prService: PRService,
               private programRequestPageMode: ProgramRequestPageModeService,
               private withFullNameService: WithFullNameService ) {
    this.pr.fundingLines = [];
  }


  async ngOnInit() {
    let phaseId: string;
    if(this.programRequestPageMode.id) { // PR is in edit mode
      this.pr = (await this.prService.getById(this.programRequestPageMode.id).toPromise()).result;
      phaseId = this.pr.phaseId;
      this.initParentFullname(phaseId);
    } else { // PR is in create mode
      this.initPr();
      phaseId = this.programRequestPageMode.phaseId;      
      this.initParentFullname(phaseId);
    }
  }

  private async initParentFullname(phaseId: string) {
    const prFullName: string = await this.withFullNameService.fullNameDerivedFromCreationTimeData(this.pr, phaseId);
    if (prFullName.lastIndexOf('/') == -1) {
      this.parentFullName = '';
    } else {
      this.parentFullName = prFullName.substring(0, prFullName.lastIndexOf('/') + 1);
    }
  }

  private initPr() {
    this.pr.phaseId = this.programRequestPageMode.phaseId;
    this.pr.creationTimeType = Type[this.programRequestPageMode.type];
    this.pr.bulkOrigin = false;
    this.pr.state = 'SAVED';
    switch (this.programRequestPageMode.type) {
      case Type.PROGRAM_OF_MRDB:
        this.pr.originalMrId = this.programRequestPageMode.reference.id;
        this.pr.creationTimeReferenceId = this.programRequestPageMode.reference.id;
        this.pr.type = this.programRequestPageMode.reference.type;
        this.pr.longName = this.programRequestPageMode.reference.longName;
        this.pr.shortName = this.programRequestPageMode.reference.shortName;
        this.initPrWith(this.programRequestPageMode.reference);
        break;
      case Type.SUBPROGRAM_OF_MRDB:
        this.initPrWith(this.programRequestPageMode.reference);
        this.pr.type = 'INCREMENT';
        this.pr.creationTimeReferenceId = this.programRequestPageMode.reference.id;
        break;
      case Type.SUBPROGRAM_OF_PR_OR_UFR:
        this.pr.type = 'INCREMENT';
        this.pr.creationTimeReferenceId = this.programRequestPageMode.reference.id;
        this.initPrWith(this.programRequestPageMode.reference);
        break;
      case Type.NEW_PROGRAM:
        this.pr.type = 'PROGRAM';
        break;
      default:
        console.log('Wrong programRequestPageMode.type');
    }
  }

  initPrWith(program: ProgramWithFullName | ProgramRequestWithFullName) {
    this.pr.acquisitionType = program.acquisitionType;
    this.pr.bsvStrategy = program.bsvStrategy;
    this.pr.commodityArea = program.commodityArea;
    this.pr.coreCapability = program.coreCapability;
    this.pr.emphases = program.emphases.slice();
    this.pr.functionalArea = program.functionalArea;
    this.pr.leadComponent = program.leadComponent;
    this.pr.manager = program.manager;
    this.pr.medicalArea = program.medicalArea;
    this.pr.nbcCategory = program.nbcCategory;
    this.pr.primaryCapability = program.primaryCapability;
    this.pr.secondaryCapability = program.secondaryCapability;
  }

  async save(state: string) {
    if(this.pr.id) {
      this.pr.state = state;
      this.pr = (await this.prService.save(this.pr.id, this.pr).toPromise()).result;
    } else {
      this.pr = (await this.prService.create(this.pr).toPromise()).result;
    }
  }

}
