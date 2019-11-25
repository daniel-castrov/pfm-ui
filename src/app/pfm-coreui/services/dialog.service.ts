import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {DialogMessage} from '../models/DialogMessage';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

	protected messageBussSource = new Subject<DialogMessage>();
	messageBus$: Observable<DialogMessage> = this.messageBussSource.asObservable();

	constructor() { }

	sendMessage(message:DialogMessage):void{
		this.messageBussSource.next(message);
	}

	displayInfo(text:string):void{
		let message:DialogMessage = new DialogMessage();
		message.type = "INFO";
		message.title = "Information";
		message.body = text;
		this.sendMessage(message);
	}

	displayError(text:string):void {
		let message:DialogMessage = new DialogMessage();
		message.type = "ERROR";
		message.title = "Error";
		message.body = text;
		this.sendMessage(message);
	}

	displayDebug(data:any):void{
		let message:DialogMessage = new DialogMessage();
		message.type = "DEBUG";
		message.title = "Debug";
		message.debug = data;
		this.sendMessage(message);
	}

	displayToastInfo(text:string):void{
		let message:DialogMessage = new DialogMessage();
		message.type = "INFO";
		message.body = text;
		message.isToast = true;
		this.sendMessage(message);
	}

	displayToastError(text:string):void{
		let message:DialogMessage = new DialogMessage();
		message.type = "ERROR";
		message.body = text;
		message.isToast = true;
		this.sendMessage(message);
	}

	displayConfirmation(text:string, title:string, okCallBack:any, cancelCallBack:any):void{
		let message:DialogMessage = new DialogMessage();
		message.type = "CONFIRMATION";
		message.title = title;
		message.body = text;
		message.okCallBack = okCallBack;
		message.cancelCallBack = cancelCallBack;
		this.sendMessage(message);
	}
}
