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
    public programmingModel: ProgrammingModel,
    private organizationService: OrganizationService,
    private planningService: PlanningService
  ) { }

  async ngOnInit() {
    this.planningService.getPlanningByYear(this.pomYear)
      .pipe(switchMap(planning => this.planningService.getMissionPriorities(planning.result.id)))
      .subscribe(missionPriorities => {
        this.missionPriorities = missionPriorities.result.map(mission => mission.title);
      });
    await this.populateDDs();
    if (!this.program) {
      this.addMode = true;
      this.program = new Program();
    }
    this.loadForm();
  }

  loadForm() {
    const me = this;
    me.form = new FormGroup({
      shortName: new FormControl(me.program.shortName, [Validators.required]),
      longName: new FormControl(me.program.longName, [Validators.required]),
      type: new FormControl(this.addMode ? 'PROGRAM' : me.program.type),
      organizationId: new FormControl(
        me.program.organizationId ? me.organizations.find(
          org => org.id === me.program.organizationId
        ).abbreviation : undefined, [Validators.required]
      ),
      divison: new FormControl(''),
      missionPriority: new FormControl('', [Validators.required]),
      agencyPriority: new FormControl(''),
      directoratePriority: new FormControl(''),
      secDef: new FormControl('value from database'),
      strategicImperative: new FormControl('value from database'),
      agencyObjective: new FormControl('value from database'),
    }, { validators: this.formValidator });

    this.disableInputsInEditMode();
  }

  async populateDDs() {
    this.organizations = (await this.organizationService.getAll().toPromise() as any).result;
    this.divisions = ['ABC', 'DEF'];
    this.missionPriorities = ['ABC', 'DEF'];
    this.agencyPriorities = ['ABC', 'DEF'];
    this.directoratePriorities = ['ABC', 'DEF'];
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
    if (this.addMode && this.programmingModel.programs.map(p => p.shortName).find(str => str === shortName)) {
      Object.assign(invalidFields, { shortName: true });
    }

    return invalidFields;
  }
}
