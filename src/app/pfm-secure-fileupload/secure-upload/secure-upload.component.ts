import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import {FileUploader} from 'ng2-file-upload';
import { AppModel } from '../../pfm-common-models/AppModel';

@Component({
  selector: 'pfm-secure-upload',
  templateUrl: './secure-upload.component.html',
  styleUrls: ['./secure-upload.component.css']
})
export class SecureUploadComponent implements OnInit{
  @ViewChild('secureUploadTemplate', {static: false}) private secureUploadTemplate: TemplateRef<any>;
	@Input() uploadTypeDisplay:string = "Files";
	@Output() onFilesUploaded:EventEmitter<boolean> = new EventEmitter<boolean>();

  busy:boolean;

	private url:string;
	uploader:FileUploader;
	hasBaseDropZoneOver:boolean;
	response:string;

	constructor(private appModel:AppModel) {
    this.url = "https://pfmdev1.pxalphaproject.com/pfm-server/library/uploadFile?area=pr";
	}

	public fileOverBase(e:any):void {
		this.hasBaseDropZoneOver = e;
	}

	public cancel():void{
	  this.onFilesUploaded.emit(false);
  }

	ngOnInit(): void {
		const token = sessionStorage.getItem('auth_token');
		this.uploader = new FileUploader({
			url: this.url,
			headers: [{name: 'Authorization', value: 'Bearer ' + token}]
		});
		this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; }; ;

		this.hasBaseDropZoneOver = false;
		this.response = '';
		this.uploader.response.subscribe( res => this.response = res );
		this.uploader.onCompleteAll = ()=>{
			this.onFilesUploaded.emit(true);
		};
	}

}

