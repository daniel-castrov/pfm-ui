import {CreationTimeType} from '../../../../generated/model/creationTimeType';
import {ProgramAndPrService} from '../../../../services/program-and-pr.service';
import {Program} from '../../../../generated/model/program';
import {Component, Input} from '@angular/core';
import {ProgramRequestPageModeService} from '../page-mode.service';
import {AbstractControl, FormControl, ValidationErrors, Validators} from '@angular/forms';
import {ProgramType} from '../../../../generated/model/programType';

@Component({
  selector: 'id-and-name',
  templateUrl: './id-and-name.component.html',
  styleUrls: ['./id-and-name.component.scss']
})
export class IdAndNameComponent {

  @Input() private pr: Program;
  private parentFullName: string;
  private invalidShortNames: Set<string>;
  private invalidLongNames: Set<string>;

  private shortname = new FormControl('', [Validators.required, this.validShortName.bind(this)]);
  private longname  = new FormControl('', [Validators.required, this.validLongName .bind(this)]);

  constructor( private programRequestPageMode: ProgramRequestPageModeService,
               private programAndPrService: ProgramAndPrService ) {
  }

  async init(pr: Program) { // do not be tempted to save the parameter 'pr'; it should be used for initialization only
    this.parentFullName = await this.getParentFullName(pr);
    const programsPlusPrs: Program[] = await this.programAndPrService.programsPlusPrs(pr.phaseId);
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

  private getInvalidShortNames(programsPlusPrs: Program[]): Set<string> {
    const nonUniqueInvalidNames: string[] = programsPlusPrs
                          .filter( (programOrPr: Program) => programOrPr.shortName.startsWith(this.parentFullName) )
                          .map( (programOrPr: Program) => programOrPr.shortName.substring(this.parentFullName.length) )
                          .map( (fullnameEnding: string) =>  fullnameEnding.substring( 0,
                                                  (fullnameEnding.indexOf('/') == -1) ? 99999 : fullnameEnding.indexOf('/')
                              ))
                          .map((name: string) => name.toUpperCase());
    return new Set(nonUniqueInvalidNames);
  }

  private getInvalidLongNames(programsPlusPrs: Program[]): Set<string> {
    const nonUniqueInvalidDescriptions: string[] = programsPlusPrs
                          .filter( (programOrPr: Program) => programOrPr.shortName.startsWith(this.parentFullName) )
                          .filter( (programOrPr: Program) => {
                            const fullnameEnding: string = programOrPr.shortName.substring(this.parentFullName.length);
                            return fullnameEnding.indexOf('/') == -1;
                          })
                          .map( (programOrPr: Program) => programOrPr.longName )
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

  private getParentFullName(pr: Program) {
    const prFullName: string = pr.shortName;
    if (prFullName.lastIndexOf('/') == -1) {
      return '';
    } else {
      return prFullName.substring(0, prFullName.lastIndexOf('/') + 1);
    }
  }

  private type() {
    if (this.pr.type == ProgramType.GENERIC) return 'SUBPROGRAM';
    if (this.pr.type === ProgramType.FOS) return 'FoS';
    return this.pr.type;
  }
}
