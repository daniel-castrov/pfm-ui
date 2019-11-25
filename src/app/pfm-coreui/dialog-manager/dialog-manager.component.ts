import { Component, OnInit } from '@angular/core';
import { DialogService } from '../services/dialog.service';
import { DialogMessage } from '../models/DialogMessage';

@Component({
  selector: 'pfm-dialog-manager',
  templateUrl: './dialog-manager.component.html',
  styleUrls: ['./dialog-manager.component.css']
})
export class DialogManagerComponent {

	displayDialog:boolean;

	toastMessageList:DialogMessage[];
	messageList:DialogMessage[];
	activeMessage:DialogMessage;

	constructor(private dialogService:DialogService) {
		this.messageList = [];
		this.toastMessageList = [];
		dialogService.messageBus$.subscribe(message => {
			if(!message.isToast){
				this.messageList.push(message);
				this.handleDialogMessageChange();
			}
			else{
				this.toastMessageList.push(message);
			}

		});
	}

	onToastMessageDismissed(message:DialogMessage):void{
		let index:number = this.toastMessageList.indexOf(message);
		if(index !== -1){
			this.toastMessageList.splice(index, 1);
		}
	}

	onDialogClose():void{
		this.activeMessage = undefined;
		this.handleDialogMessageChange();
	}

	onDialogOk():void{
		this.activeMessage.okCallBack();
		this.activeMessage = undefined;
		this.handleDialogMessageChange();
	}

	onDialogCancel():void{
		this.activeMessage.cancelCallBack();
		this.activeMessage = undefined;
		this.handleDialogMessageChange();
	}

	private handleDialogMessageChange(){
		if(!this.activeMessage && this.messageList.length > 0){
			this.activeMessage = this.messageList.pop();
			this.displayDialog = true;
		}
		else{
			this.displayDialog = false;
		}
	}
}
