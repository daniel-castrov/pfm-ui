import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {

  @ViewChild("modal") private modalReference;
  @Output() cancelEvent: EventEmitter<any> = new EventEmitter();
  @Output() okEvent: EventEmitter<any> = new EventEmitter();
  @Output() closeEvent: EventEmitter<any> = new EventEmitter();
  @Output() openEvent: EventEmitter<any> = new EventEmitter();
  @Input() confirmationMessage;
  @Input() note?;
  @Input() title;
  @Input() okButtonText?;
  @Input() cancelButtonText?;
  modal;

  constructor(public modalService: NgbModal) { }

  ngOnInit() {
  }

  open() {
    this.modal = this.modalService.open(this.modalReference);
    this.openEvent.emit();
  }

  onClose() {
    this.modal.close();
    this.closeEvent.emit();
  }

  onCancel() {
    this.modal.dismiss('cancel click');
    this.cancelEvent.emit();
  }

  onOk() {
    this.modal.close('Ok click');
    this.okEvent.emit();
  }
}
