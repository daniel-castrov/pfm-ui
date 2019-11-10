export class DialogMessage {
	type:string;//INFO, ERROR, DEBUG
	title:string;//defaults based on type, Info, Error, Debug, not used for toast messages
	body:string;//the content to display
	debug:any;//just for DEBUG
	isToast:boolean = false;
	labelForOk:string = "OK";
	labelForCancel:string = "Cancel";
	//TODO - add in the callbacks for ok/cancel
}