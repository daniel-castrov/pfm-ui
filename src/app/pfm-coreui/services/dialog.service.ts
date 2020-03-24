import { Injectable, TemplateRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DialogMessage } from '../models/DialogMessage';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  protected messageBussSource = new Subject<DialogMessage>();
  messageBus$: Observable<DialogMessage> = this.messageBussSource.asObservable();

  constructor(
    private messageService: MessageService
  ) { }

  sendMessage(message: DialogMessage): void {
    this.messageBussSource.next(message);
  }

  displayInfo(text: string): void {
    const message: DialogMessage = new DialogMessage();
    message.type = 'INFO';
    message.title = 'Information';
    message.body = text;
    this.sendMessage(message);
  }

  displayError(text: string): void {
    const message: DialogMessage = new DialogMessage();
    message.type = 'ERROR';
    message.title = 'Error';
    message.body = text;
    this.sendMessage(message);
  }

  displayDebug(data: any): void {
    const message: DialogMessage = new DialogMessage();
    message.type = 'DEBUG';
    message.title = 'Debug';
    message.debug = data;
    this.sendMessage(message);
  }

  displayConfirmation(text: string, title: string, okCallBack: any, cancelCallBack: any): void {
    const message: DialogMessage = new DialogMessage();
    message.type = 'CONFIRMATION';
    message.title = title;
    message.body = text;
    message.okCallBack = okCallBack;
    message.cancelCallBack = cancelCallBack;
    this.sendMessage(message);
  }

  displayCustom(title: string, customTemplate: TemplateRef<any>) {
    const message: DialogMessage = new DialogMessage();
    message.type = 'CUSTOM';
    message.title = title;
    message.customTemplate = customTemplate;
    this.sendMessage(message);
  }

  displayCheckBoxSelection(text: string, title: string, attachments: any[], okCallBack: any, cancelCallBack: any) {
    const message: DialogMessage = new DialogMessage();
    message.type = 'CHECKSELECTION';
    message.title = title;
    message.body = text;
    message.data = attachments;
    message.okCallBack = okCallBack;
    message.cancelCallBack = cancelCallBack;
    this.sendMessage(message);
  }
}
