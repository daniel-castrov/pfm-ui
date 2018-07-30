import { ProgrammaticRequestState } from './../../../generated/model/programmaticRequestState';
import { CreationTimeType } from './../../../generated/model/creationTimeType';
import { ProgramType } from './../../../generated/model/programType';
import { IdAndNameComponent } from './id-and-name/id-and-name.component';
import { ProgramRequestWithFullName, ProgramWithFullName } from './../../../services/with-full-name.service';
import { ProgrammaticRequest } from './../../../generated/model/programmaticRequest';
import { PRService } from './../../../generated/api/pR.service';
import { Component, OnInit, ViewChild} from '@angular/core';

// Other Components
import { ProgramRequestPageModeService} from './page-mode.service';

@Component({
  selector: 'program-request',
  templateUrl: './program-request.component.html',
  styleUrls: ['./program-request.component.scss']
})
export class ProgramRequestComponent implements OnInit {

  private pr: ProgrammaticRequest = {};
  @ViewChild(IdAndNameComponent) private idAndNameComponent: IdAndNameComponent;

  constructor( private prService: PRService,
               private programRequestPageMode: ProgramRequestPageModeService ) {
    this.pr.fundingLines = [];
  }

  async ngOnInit() {
    await this.initPr();
    this.idAndNameComponent.init(this.pr);
  }

  private async initPr() {
    if (this.programRequestPageMode.prId) { // PR is in edit mode
      this.pr = (await this.prService.getById(this.programRequestPageMode.prId).toPromise()).result;
    } else { // PR is in create mode
      this.initPrFields();
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
        this.pr.type = this.programRequestPageMode.reference.type;
        this.pr.longName = this.programRequestPageMode.reference.longName;
        this.pr.shortName = this.programRequestPageMode.reference.shortName;
        this.initPrWith(this.programRequestPageMode.reference);
        break;
      case CreationTimeType.SUBPROGRAM_OF_MRDB:
        this.initPrWith(this.programRequestPageMode.reference);
        this.pr.type = ProgramType.GENERIC;
        this.pr.creationTimeReferenceId = this.programRequestPageMode.reference.id;
        break;
      case CreationTimeType.SUBPROGRAM_OF_PR_OR_UFR:
        this.pr.type = ProgramType.GENERIC;
        this.pr.creationTimeReferenceId = this.programRequestPageMode.reference.id;
        this.initPrWith(this.programRequestPageMode.reference);
        break;
      case CreationTimeType.NEW_PROGRAM:
        this.pr.type = ProgramType.PROGRAM;
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
    this.pr.description = program.description;
    this.pr.emphases = program.emphases.slice();
    this.pr.functionalArea = program.functionalArea;
    this.pr.leadComponent = program.leadComponent;
    this.pr.manager = program.manager;
    this.pr.medicalArea = program.medicalArea;
    this.pr.nbcCategory = program.nbcCategory;
    this.pr.primaryCapability = program.primaryCapability;
    this.pr.secondaryCapability = program.secondaryCapability;
  }

  async save(state: ProgrammaticRequestState) {
    if(this.pr.id) {
      this.pr.state = state;
      this.pr = (await this.prService.save(this.pr.id, this.pr).toPromise()).result;
    } else {
      this.pr = (await this.prService.create(this.pr).toPromise()).result;
    }
  }

}
