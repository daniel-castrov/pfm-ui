import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UFR } from 'src/app/programming-feature/models/ufr.model';

@Component({
  selector: 'pfm-ufr-justification',
  templateUrl: './ufr-justification.component.html',
  styleUrls: ['./ufr-justification.component.scss']
})
export class UfrJustificationComponent implements OnInit {
  @Input() ufr: UFR;

  form: FormGroup;
  editMode: boolean;

  constructor() {}

  ngOnInit(): void {
    this.loadForm();
    this.editMode = false;
    this.changeEditMode(false);
  }

  loadForm() {
    this.form = new FormGroup({
      justification: new FormControl(this.ufr.justification ?? '', Validators.required),
      impactN: new FormControl(this.ufr.impactN ?? '', Validators.required),
      milestoneImpact: new FormControl(this.ufr.milestoneImpact ?? '', Validators.required)
    });
  }

  changeEditMode(editMode: boolean) {
    this.editMode = editMode;

    if (editMode) {
      this.form.get('justification').enable();
      this.form.get('impactN').enable();
      this.form.get('milestoneImpact').enable();
    } else {
      this.form.get('justification').disable();
      this.form.get('impactN').disable();
      this.form.get('milestoneImpact').disable();
    }
  }
}
