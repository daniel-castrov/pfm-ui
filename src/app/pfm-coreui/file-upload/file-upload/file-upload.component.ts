import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileUploadService } from 'src/app/pfm-secure-filedownload/services/file-upload.service';
import { FileMetaData } from 'src/app/pfm-common-models/FileMetaData';

declare const $: any;

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})

export class FileUploadComponent implements OnInit {

  @Output() fileUploadEvent: EventEmitter<FileMetaData> = new EventEmitter();
  @Output() uploading: EventEmitter<boolean> = new EventEmitter();
  @Input() area: string;
  @Input() disabled: boolean;
  @Input() isImageThumbnail: boolean;
  @Input() imagePath: string;
  processing = false;
  uploadSuccess = false;

  fileName: string;

  constructor(
    private fileUploadService: FileUploadService
  ) { }

  ngOnInit() {
  }

  onImageClick() {
    $('#hidden-input-file').trigger('click');
  }

  onFileChange(event) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.fileUploadService.uploadSecureResource(file).then(resp => {
        this.fileUploadEvent.emit((resp.result) as FileMetaData);
      });
    }
  }
}

export interface FileResponse {
  id?: string;
  content?: string;
  contentType?: string;
}
