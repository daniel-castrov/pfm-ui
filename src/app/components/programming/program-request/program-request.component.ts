import { ProgramRequestWithFullName, ProgramWithFullName, WithFullName, WithFullNameService, ProgramOrPrWithFullName } from './../../../services/with-full-name.service';
import { ProgrammaticRequest } from './../../../generated/model/programmaticRequest';
import { PRService } from './../../../generated/api/pR.service';
import { Component, OnInit } from '@angular/core';

// Other Components
import { ProgramRequestPageModeService, Type } from './page-mode.service';
import { AbstractControl, ValidationErrors, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'program-request',
  templateUrl: './program-request.component.html',
  styleUrls: ['./program-request.component.scss']
})
export class ProgramRequestComponent implements OnInit {

  pr: ProgrammaticRequest = {};
  parentFullName: string;
  invalidShortNames: Set<string>;
  invalidLongNames: Set<string>;

  shortname = new FormControl('', [Validators.required, this.validShortName.bind(this)]);
  longname  = new FormControl('', [Validators.required, this.validLongName .bind(this)]);

  constructor( private prService: PRService,
               private programRequestPageMode: ProgramRequestPageModeService,
               private withFullNameService: WithFullNameService ) {
    this.pr.fundingLines = [];
  }

  async ngOnInit() {
    const phaseId: string = await this.initPr();
    this.parentFullName = await this.getParentFullName(phaseId);
    const programsPlusPrs: WithFullName[] = await this.withFullNameService.programsPlusPrs(phaseId);
    this.invalidShortNames = this.getInvalidShortNames(programsPlusPrs);
    this.invalidLongNames = this.getInvalidLongNames(programsPlusPrs);
  }

  private getInvalidShortNames(programsPlusPrs: WithFullName[]): Set<string> {
    const nonUniqueInvalidNames: string[] = programsPlusPrs
                          .filter( (programOrPr: WithFullName) => programOrPr.fullname.startsWith(this.parentFullName) )
                          .map( (programOrPr: WithFullName) => programOrPr.fullname.substring(this.parentFullName.length) )
                          .map( (fullnameEnding: string) =>  fullnameEnding.substring( 0,
                                                  (fullnameEnding.indexOf('/') == -1) ? 99999 : fullnameEnding.indexOf('/')
                              ))
                          .map((name: string) => name.toUpperCase());
    return new Set(nonUniqueInvalidNames);
  }

  private getInvalidLongNames(programsPlusPrs: ProgramOrPrWithFullName[]): Set<string> {
    const nonUniqueInvalidDescriptions: string[] = programsPlusPrs
                          .filter( (programOrPr: ProgramOrPrWithFullName) => programOrPr.fullname.startsWith(this.parentFullName) )
                          .filter( (programOrPr: ProgramOrPrWithFullName) => {
                            const fullnameEnding: string = programOrPr.fullname.substring(this.parentFullName.length);
                            return fullnameEnding.indexOf('/') == -1;
                          })
                          .map( (programOrPr: ProgramOrPrWithFullName) => programOrPr.longName )
                          .map((name: string) => name.toUpperCase());
    return new Set(nonUniqueInvalidDescriptions);
  }

  private validShortName(control: AbstractControl): ValidationErrors | null {
    if(!this.invalidShortNames) return null; // if ngOnInit() has not been called yet there cannot be any validation
    if(this.invalidShortNames.has(this.pr.shortName.toLocaleUpperCase())) return {alreadyExists:true};
    return null;
  }

  private validLongName(control: AbstractControl): ValidationErrors | null {
    if(!this.invalidLongNames) return null; // if ngOnInit() has not been called yet there cannot be any validation
    if(this.invalidLongNames.has(this.pr.longName.toLocaleUpperCase()))  return {alreadyExists:true};
    return null;
  }

  private async getParentFullName(phaseId: string) {
    const prFullName: string = await this.withFullNameService.fullNameDerivedFromCreationTimeData(this.pr, phaseId);
    if (prFullName.lastIndexOf('/') == -1) {
      return '';
    } else {
      return prFullName.substring(0, prFullName.lastIndexOf('/') + 1);
    }
  }

  private async initPr() {
    if (this.programRequestPageMode.id) { // PR is in edit mode
      this.pr = (await this.prService.getById(this.programRequestPageMode.id).toPromise()).result;
      return this.pr.phaseId;
    } else { // PR is in create mode
      this.initPrFields();
      return this.programRequestPageMode.phaseId;
    }
  }

  private initPrFields() {
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

  async save(state: string) {
    if(this.pr.id) {
      this.pr.state = state;
      this.pr = (await this.prService.save(this.pr.id, this.pr).toPromise()).result;
    } else {
      this.pr = (await this.prService.create(this.pr).toPromise()).result;
    }
  }

}
