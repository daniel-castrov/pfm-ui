import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UFR } from 'src/app/programming-feature/models/ufr.model';
import { ShortyType } from 'src/app/programming-feature/models/enumerations/shorty-type.model';
import { TitleCasePipe, formatDate } from '@angular/common';
import { Disposition } from 'src/app/programming-feature/models/enumerations/disposition.model';

@Component({
  selector: 'pfm-ufr-form',
  templateUrl: './ufr-form.component.html',
  styleUrls: ['./ufr-form.component.scss']
})
export class UfrFormComponent implements OnInit {
  @Input() ufr: UFR;

  readonly DEFAULT_DISPOSITION = 'No entry yet.  Will be added when disposition is set.';

  form: FormGroup;

  constructor(private titlecasePipe: TitleCasePipe) {}

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm() {
    this.form = new FormGroup({
      requestNumber: new FormControl(this.ufr.requestNumber),
      ShortyType: new FormControl(this.getShortyTypeLabel(this.ufr.shortyType)),
      ufrName: new FormControl(this.ufr.ufrName, Validators.required),
      notes: new FormControl(this.ufr.notes, [Validators.required]),
      ufrStatus_disposition: new FormControl(
        this.ufr.disposition
          ? this.getDispositionLabel(this.ufr.disposition)
          : this.titlecasePipe.transform(this.ufr.ufrStatus)
      ),
      dispositionExplanation: new FormControl(
        this.ufr.dispositionExplanation ? this.ufr.dispositionExplanation : this.DEFAULT_DISPOSITION
      ),
      created: new FormControl(formatDate(this.ufr.created, 'M/d/yyyy HH:mm', 'en-US')),
      createdBy: new FormControl(this.ufr.createdBy),
      modified: new FormControl(formatDate(this.ufr.modified, 'M/d/yyyy HH:mm', 'en-US')),
      modifiedBy: new FormControl(this.ufr.modifiedBy)
    });
    this.disableInput();
  }

  disableInput() {
    this.form.controls['requestNumber'].disable();
    this.form.controls['ShortyType'].disable();
    this.form.controls['ufrStatus_disposition'].disable();
    this.form.controls['dispositionExplanation'].disable();
    this.form.controls['created'].disable();
    this.form.controls['createdBy'].disable();
    this.form.controls['modified'].disable();
    this.form.controls['modifiedBy'].disable();
  }
  getShortyTypeLabel(shortyType: ShortyType) {
    switch (shortyType) {
      case ShortyType.MRDB_PROGRAM: {
        return 'Previously Funded Program';
      }
      case ShortyType.PR: {
        return 'Program Request';
      }
      case ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM: {
        return 'New Increment';
      }
      case ShortyType.NEW_INCREMENT_FOR_PR: {
        return 'New Increment';
      }
      case ShortyType.NEW_INCREMENT: {
        return 'New Increment';
      }
      case ShortyType.NEW_FOS_FOR_MRDB_PROGRAM: {
        return 'FoS';
      }
      case ShortyType.NEW_FOS_FOR_PR: {
        return 'FoS';
      }
      case ShortyType.NEW_FOS: {
        return 'FoS';
      }
      case ShortyType.NEW_PROGRAM: {
        return 'New Program';
      }
      default:
        return '';
    }
  }

  getDispositionLabel(disposition: Disposition) {
    switch (disposition) {
      case Disposition.APPROVED: {
        return 'Approved';
      }
      case Disposition.PARTIALLY_APPROVED: {
        return 'Program Request';
      }
      case Disposition.DISAPPROVED: {
        return 'Disapproved';
      }
      case Disposition.DEFERRED: {
        return 'Deferred to Future POM';
      }
      case Disposition.YEAR_OF_EXECUTION: {
        return 'Deferred to YOE';
      }
      case Disposition.ISSUE_PAPER: {
        return 'Issue Paper';
      }
      default:
        return '';
    }
  }
}
