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
    this.loadForm();
  }

  loadForm() {
    const me = this;
    me.form = new FormGroup({
      shortName: new FormControl(me.programData.shortName ? me.programData.shortName : ''),
      longName: new FormControl(me.programData.longName ? me.programData.longName : '', [Validators.required]),
      type: new FormControl(me.programData.type ? me.programData.type : ''),
      organizationId: new FormControl(me.programData.organizationId ? me.programData.organizationId : ''),
      divison: new FormControl(''),
      missionPriority: new FormControl('', [Validators.required]),
      agencyPriority: new FormControl(''),
      directoratePriority: new FormControl(''),
      secDef: new FormControl('value from database'),
      strategicImperative: new FormControl('value from database'),
      agencyObjective: new FormControl('value from database'),
    }, { validators: this.formValidator });

    this.divisions = this.missionPriorities = this.agencyPriorities = this.directoratePriorities = ['ABC', 'DEF'];
  }

  onSave() {
    console.log(this.form.getRawValue());
  }

  onUploading(event) {
    this.isUploading = event;
  }

  onFileUploaded(event) {
    this.fileid = event.id;
  }

  formValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const invalidFields = { longName: false };

    // generic validations
    if (control.get('longName').invalid) {
      Object.assign(invalidFields, { longName: true });
    }
    if (control.get('missionPriority').invalid) {
      Object.assign(invalidFields, { missionPriority: true });
    }

    return invalidFields;
  }
}
