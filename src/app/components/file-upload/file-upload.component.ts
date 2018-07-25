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

  @Output() fileUploadEvent: EventEmitter<FileResponse >=new EventEmitter();
  @Input() area: string;

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
        this.libraryService.uploadFile(file, this.area).subscribe(response => {
          if (response.result) {
            this.fileUploadEvent.emit(response.result);
          }
        })
      }
    }
  }
}
