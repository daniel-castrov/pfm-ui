import { Component, OnInit, Input } from '@angular/core';
import { Program } from '../../../models/Program';
import { FormGroup, FormControl, ValidatorFn, ValidationErrors, Validators } from '@angular/forms';
import { ProgrammingModel } from '../../../../programming-feature/models/ProgrammingModel';
import { OrganizationService } from '../../../../services/organization-service';
import { Organization } from '../../../../pfm-common-models/Organization';
import { PlanningService } from 'src/app/planning-feature/services/planning-service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'pfm-requests-details-form',
  templateUrl: './requests-details-form.component.html',
  styleUrls: ['./requests-details-form.component.scss']
})
export class RequestsDetailsFormComponent implements OnInit {

  @Input() pomYear: number;
  @Input() program: Program;

  form: FormGroup;
  addMode = false;
  organizations: Organization[];
  divisions: string[];
  missionPriorities: string[];
  agencyPriorities: string[];
  directoratePriorities: string[];
  fileid: string;
  isUploading: boolean;

  constructor(
    private organizationService: OrganizationService,
    private planningService: PlanningService
  ) { }

  async ngOnInit() {
    await this.populateDropDowns();
    if (!this.program) {
      this.addMode = true;
      this.program = new Program();
    }
    this.loadForm();
  }

  loadForm() {
    this.form = new FormGroup({
      shortName: new FormControl(this.program.shortName, [Validators.required]),
      longName: new FormControl(this.program.longName, [Validators.required]),
      type: new FormControl(this.addMode ? 'PROGRAM' : this.program.type),
      organizationId: new FormControl(
        this.program.organizationId ? this.organizations.find(
          org => org.id === this.program.organizationId
        ).abbreviation : undefined, [Validators.required]
      ),
      division: new FormControl(''),
      missionPriority: new FormControl('', [Validators.required]),
      agencyPriority: new FormControl(''),
      directoratePriority: new FormControl(''),
      secDefLOE: new FormControl(this.program.secDefLOE),
      strategicImperative: new FormControl(this.program.strategicImperative),
      agencyObjective: new FormControl(this.program.agencyObjective),
    }, { validators: this.formValidator });

    this.disableInputsInEditMode();
  }

  async populateDropDowns() {
    this.organizations = (await this.organizationService.getAll().toPromise() as any).result;
    this.planningService.getPlanningByYear(this.pomYear)
      .pipe(switchMap(planning => this.planningService.getMissionPriorities(planning.result.id)))
      .subscribe(missionPriorities => {
        this.missionPriorities = missionPriorities.result.map(mission => mission.title);
      });
    this.divisions = ['ABC', 'DEF'];
    this.agencyPriorities = [].constructor(20);
    this.directoratePriorities = [].constructor(20);
  }

  disableInputsInEditMode() {
    this.form.controls['type'].disable();
    if (!this.addMode) {
      this.form.controls['shortName'].disable();
      this.form.controls['organizationId'].disable();
    }
  }

  onUploading(event) {
    this.isUploading = event;
  }

  onFileUploaded(event) {
    this.fileid = event.id;
  }

  formValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const invalidFields = {};

    // specific validations
    const shortName = control.get('shortName').value as string;
    if (this.addMode && this.program.shortName === shortName) {
      Object.assign(invalidFields, { shortName: true });
    }

    return invalidFields;
  }
}
