import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

// Other Components
import {FileResponse, LibraryService} from "../../generated";

declare const $: any;

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})

export class FileUploadComponent implements OnInit {

  @Output() fileUploadEvent: EventEmitter<FileResponse> = new EventEmitter();
  @Output() uploading: EventEmitter<boolean> = new EventEmitter();
  @Input() area: string;
  @Input() disabled: boolean;
  doingit: boolean = false;
  private uploadsuccess: boolean = false;

  fileName: string;

  constructor(private libraryService: LibraryService) {}

  ngOnInit() {}

  onFileChange(event){
    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.fileName = file.name;
        this.doingit = true;
        this.uploadsuccess = false;
        this.uploading.emit(this.doingit);
        this.libraryService.uploadFile(file, this.area).subscribe(response => {
          this.doingit = false;
          this.uploading.emit(this.doingit);
          if (response.result) {
            this.uploadsuccess = true;
            this.fileUploadEvent.emit(response.result);
          }
        })
      }
    }
  }
}
