import { CreationTimeType } from '../../../../generated/model/creationTimeType';
import { WithFullName, WithFullNameService, ProgramOrPrWithFullName } from '../../../../services/with-full-name.service';
import { ProgrammaticRequest } from '../../../../generated/model/programmaticRequest';
import { Component, Input } from '@angular/core';

// Other Components
import { ProgramRequestPageModeService} from '../page-mode.service';
import { AbstractControl, ValidationErrors, FormControl, Validators } from '@angular/forms';
import { ProgramType } from '../../../../generated/model/programType';

@Component({
  selector: 'id-and-name',
  templateUrl: './id-and-name.component.html',
  styleUrls: ['./id-and-name.component.scss']
})
export class IdAndNameComponent {

  @Input() private pr: ProgrammaticRequest;
  private parentFullName: string;
  private invalidShortNames: Set<string>;
  private invalidLongNames: Set<string>;

  private shortname = new FormControl('', [Validators.required, this.validShortName.bind(this)]);
  private longname  = new FormControl('', [Validators.required, this.validLongName .bind(this)]);

  constructor( private programRequestPageMode: ProgramRequestPageModeService,
               private withFullNameService: WithFullNameService ) {
  }

  async init(pr: ProgrammaticRequest) { // do not be tempted to save the parameter 'pr'; it should be used for initialization only
    this.parentFullName = await this.getParentFullName(pr);
    const programsPlusPrs: WithFullName[] = await this.withFullNameService.programsPlusPrs(pr.phaseId);
    this.invalidShortNames = this.getInvalidShortNames(programsPlusPrs);
    this.invalidLongNames = this.getInvalidLongNames(programsPlusPrs);
  }

  get invalid(): boolean {
    if(this.programRequestPageMode.prId) {
      return false;
    } else {
      switch (this.programRequestPageMode.type) {
        case CreationTimeType.PROGRAM_OF_MRDB:
          return false;
        case CreationTimeType.SUBPROGRAM_OF_MRDB:
        case CreationTimeType.SUBPROGRAM_OF_PR:
        case CreationTimeType.NEW_PROGRAM:
          return this.shortname.invalid || this.longname.invalid;
        default:
          console.log('Wrong programRequestPageMode.type in IdAndNameComponent.invalid()');
      }
    }
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
    if(!this.invalidShortNames) return null; // if init(...) has not been called yet there cannot be any validation
    if(this.invalidShortNames.has(this.pr.shortName.toLocaleUpperCase())) return {alreadyExists:true};
    return null;
  }

  private validLongName(control: AbstractControl): ValidationErrors | null {
    if(!this.invalidLongNames) return null; // if init(...) has not been called yet there cannot be any validation
    if(this.invalidLongNames.has(this.pr.longName.toLocaleUpperCase()))  return {alreadyExists:true};
    return null;
  }

  private async getParentFullName(pr: ProgrammaticRequest) {
    const prFullName: string = await this.withFullNameService.fullNameDerivedFromCreationTimeData(pr);
    if (prFullName.lastIndexOf('/') == -1) {
      return '';
    } else {
      return prFullName.substring(0, prFullName.lastIndexOf('/') + 1);
    }
  }

  private type() {
    if(this.pr.type == ProgramType.GENERIC) return 'SUBPROGRAM';
    return this.pr.type;
  }
}
