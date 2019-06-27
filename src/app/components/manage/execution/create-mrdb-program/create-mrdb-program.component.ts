import { Component, OnInit } from '@angular/core';
import {MRDBService, OrganizationService, Pom, Program, ProgramType} from "../../../../generated";
import {AbstractControl, FormControl, ValidationErrors, Validators} from "@angular/forms";
import {Notify} from "../../../../utils/Notify";
import {Router} from "@angular/router";

@Component({
  selector: 'app-create-mrdb-program',
  templateUrl: './create-mrdb-program.component.html',
  styleUrls: ['./create-mrdb-program.component.scss']
})
export class CreateMrdbProgramComponent implements OnInit {

  public pr: Program = {};
  public pom: Pom = {};

  private invalidShortNames: Set<string>;
  private invalidLongNames: Set<string>;

  public shortname = new FormControl('', [Validators.required, this.validChildName.bind(this)]);
  public longname  = new FormControl('', [Validators.required, this.validLongName .bind(this)]);

  constructor( private mrdbService:MRDBService,
               private orgSvc: OrganizationService,
               private router: Router) { }

  async ngOnInit() {
    const programs: Program[] = (await this.mrdbService.getAll().toPromise()).result;
    this.invalidShortNames = this.getInvalidShortNames(programs);
    this.invalidLongNames = this.getInvalidLongNames(programs);
  }

  private getInvalidShortNames(programs: Program[]): Set<string> {
    const nonUniqueInvalidNames: string[] = programs.map( p => p.shortName );
    return new Set(nonUniqueInvalidNames);
  }

  private getInvalidLongNames(programs: Program[]): Set<string> {
    const nonUniqueInvalidDescriptions: string[] = programs.map( p => p.longName );
    return new Set(nonUniqueInvalidDescriptions);
  }

  private validChildName(control: AbstractControl): ValidationErrors | null {
    if(!this.invalidShortNames) return null; // if init(...) has not been called yet there cannot be any validation
    if(this.invalidShortNames.has(this.shortname.value.toLocaleUpperCase())) return {alreadyExists:true};
    return null;
  }

  private validLongName(control: AbstractControl): ValidationErrors | null {
    if(!this.invalidLongNames) return null; // if init(...) has not been called yet there cannot be any validation
    if(this.invalidLongNames.has(this.longname.value.toLocaleUpperCase()))  return {alreadyExists:true};
    return null;
  }

  async submit(){
    this.pr.type=ProgramType.PROGRAM;
    this.pr.organizationId = (await this.orgSvc.getByAbbreviation(this.pr.leadComponent).toPromise()).result.id;
    await this.mrdbService.create(this.pr).toPromise();
    console.log(this.pr);
    Notify.success("New Unfunded Program \"" + (this.pr.shortName) + "\" has been created");
    this.router.navigate(['/home']);
  }

  private isNotSubmittable(){
    if (  this.pr &&  this.pr.shortName && this.pr.longName &&
          this.pr.primaryCapability && this.pr.coreCapability && this.pr.functionalArea &&
          !this.invalidLongNames.has(this.longname.value.toLocaleUpperCase()) &&
          !this.invalidShortNames.has(this.shortname.value.toLocaleUpperCase())
    ){
      return false;
    }
    return true;
  }
}
