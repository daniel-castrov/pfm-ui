import { Component, OnInit, Input } from '@angular/core';
import { Program } from '../../../models/Program';
import { FormGroup, FormControl, ValidatorFn, ValidationErrors, Validators } from '@angular/forms';
import { ProgrammingModel } from '../../../../programming-feature/models/ProgrammingModel';

@Component({
  selector: 'pfm-requests-details-form',
  templateUrl: './requests-details-form.component.html',
  styleUrls: ['./requests-details-form.component.scss']
})
export class RequestsDetailsFormComponent implements OnInit {

  @Input() programData: Program;

  public form: FormGroup;
  public addMode = false;
  organizations: string[];
  divisions: string[];
  missionPriorities: string[];
  agencyPriorities: string[];
  directoratePriorities: string[];
  fileid: string;
  isUploading: boolean;

  constructor(
    public programmingModel: ProgrammingModel,
  ) { }

  ngOnInit() {
    this.programData = this.programmingModel.programs.find((p: Program) => {
      return p.shortName === this.programmingModel.selectedProgramName;
    });
    if ( !this.programData ) {
      this.addMode = true;
      this.programData = new Program();
      this.programData.type = 'PROGRAM';
    }
    this.loadForm();
  }

  loadForm() {
    const me = this;
    me.form = new FormGroup({
      shortName: new FormControl(me.programData.shortName, [Validators.required]),
      longName: new FormControl(me.programData.longName, [Validators.required]),
      type: new FormControl(me.programData.type),
      organizationId: new FormControl(me.programData.organizationId, [Validators.required]),
      divison: new FormControl(''),
      missionPriority: new FormControl('', [Validators.required]),
      agencyPriority: new FormControl(''),
      directoratePriority: new FormControl(''),
      secDef: new FormControl('value from database'),
      strategicImperative: new FormControl('value from database'),
      agencyObjective: new FormControl('value from database'),
    }, { validators: this.formValidator });

    this.populateDDs();
    this.disableInputsInEditMode();
  }

  populateDDs() {
    this.organizations = ['ABC', 'DEF'];
    this.divisions = ['ABC', 'DEF'];
    this.missionPriorities = ['ABC', 'DEF'];
    this.agencyPriorities = ['ABC', 'DEF'];
    this.directoratePriorities = ['ABC', 'DEF'];
  }

  disableInputsInEditMode() {
    this.form.controls['type'].disable();
    if ( !this.addMode ) {
      this.form.controls['shortName'].disable();
      this.organizations.push(this.programData.organizationId);
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
