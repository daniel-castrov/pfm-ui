import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

// Other Components
// import {FileResponse, LibraryService} from "../../generated";

declare const $: any;

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})

export class FileUploadComponent implements OnInit {

  // @Output() fileUploadEvent: EventEmitter<FileResponse> = new EventEmitter();
  @Output() fileUploadEvent: EventEmitter<any> = new EventEmitter();
  @Output() uploading: EventEmitter<boolean> = new EventEmitter();
  @Input() area: string;
  @Input() disabled: boolean;
  @Input() isImageThumbnail: boolean;
  @Input() imagePath: string;
  processing: boolean = false;
  uploadSuccess: boolean = false;

  fileName: string;

  constructor(
//    private libraryService: LibraryService,
  ) {}

  ngOnInit() {
  }

  onImageClick(){
    $('#hidden-input-file').trigger('click');
  }

  onFileChange(event){
    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.fileName = file.name;
        this.processing = true;
        this.uploadSuccess = false;
        this.uploading.emit(this.processing);
        // this.libraryService.uploadFile(file, this.area).subscribe(response => {
        //   this.processing = false;
        //   this.uploading.emit(this.processing);
        //   if (response.result) {
        //     this.uploadSuccess = true;
        //     this.fileUploadEvent.emit(response.result);
        //   }
        // });
        this.uploadSuccess = true;
        this.fileUploadEvent.emit('');
      }
    }
  }
}
