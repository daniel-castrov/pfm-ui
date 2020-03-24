import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private messageService: MessageService
  ) { }

  displaySuccess(text: string): void {
    this.messageService.add({
      severity: 'success',
      summary: '',
      detail: text,
      life: 10000
    });
  }

  displayInfo(text: string): void {
    this.messageService.add({
      severity: 'info',
      summary: '',
      detail: text,
      life: 10000
    });
  }

  displayWarning(text: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: '',
      detail: text,
      life: 10000
    });
  }

  displayError(text: string): void {
    this.messageService.add({
      severity: 'error',
      summary: '',
      detail: text,
      life: 10000
    });
  }

}
