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

  constructor() {}

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm() {
    this.form = new FormGroup({
      justification: new FormControl('', Validators.required),
      impactN: new FormControl('', Validators.required),
      milestoneImpact: new FormControl('', Validators.required)
    });
  }
}
