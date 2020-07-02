import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FileItem, FileUploader, ParsedResponseHeaders } from 'ng2-file-upload';
import { AppModel } from '../../pfm-common-models/AppModel';
import { FileMetaData } from '../../pfm-common-models/FileMetaData';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'pfm-secure-upload',
  templateUrl: './secure-upload.component.html',
  styleUrls: ['./secure-upload.component.css']
})
export class SecureUploadComponent implements OnInit {
  @ViewChild('secureUploadTemplate') private secureUploadTemplate: TemplateRef<any>;
  @Input() uploadTypeDisplay = 'Files';
  @Input() uploadToServer = true;
  @Input() accept: string;
  @Output() onFilesUploaded: EventEmitter<FileMetaData> = new EventEmitter<FileMetaData>();

  uploadInprogressFlag: boolean;
  private fileMetaData: FileMetaData;
  private url: string;
  uploader: FileUploader;
  hasBaseDropZoneOver: boolean;
  response: string;

  constructor(private appModel: AppModel) {
    this.url = environment.apiUrl + '/library/uploadFile?area=pr';
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  cancel(): void {
    this.onFilesUploaded.emit(null);
    setTimeout(() => {
      this.init();
    });
  }

  isFileSelected(): boolean {
    return this.uploader && this.uploader.queue && this.uploader.queue.length > 0;
  }

  ngOnInit(): void {
    this.init();
  }

  private init(): void {
    const token = sessionStorage.getItem('auth_token');
    this.uploader = new FileUploader({
      url: this.url,
      headers: [{ name: 'Authorization', value: 'Bearer ' + token }]
    });
    this.uploader.onAfterAddingFile = file => {
      this.uploader.queue = [file];
      file.withCredentials = false;
    };
    this.hasBaseDropZoneOver = false;
    this.response = '';
    if (!this.uploadToServer) {
      this.uploader.onAfterAddingFile = (fileItem: FileItem) => {
        fileItem._file.arrayBuffer().then(bufferedData => {
          const blobFile: Blob = new Blob([bufferedData]);
          const file = new FileMetaData();
          (file.name = fileItem.file.name), (file.contentType = fileItem.file.type);
          file.file = blobFile;
          this.onFilesUploaded.emit(file);
        });
        this.uploader.removeFromQueue(fileItem);
      };
    }

    this.uploader.response.subscribe(res => {
      this.response = res;
    });
    (this.uploader.onSuccessItem = (item, response, status, headers) => {
      const data = JSON.parse(response); // success server response
      this.fileMetaData = new FileMetaData();
      this.fileMetaData = data;
    }),
      (this.uploader.onCompleteAll = () => {
        this.onFilesUploaded.emit(this.fileMetaData);
        setTimeout(() => {
          this.init();
        });
      });
  }

  uploadFile() {
    if (this.isFileSelected) {
      this.uploadInprogressFlag = true;
      this.uploader.uploadAll();
    }
  }
}
