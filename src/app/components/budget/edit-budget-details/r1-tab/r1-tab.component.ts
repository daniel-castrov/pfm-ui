import { Component, OnChanges, Input } from '@angular/core';
import { RdteData, LibraryService } from '../../../../generated';
import { Notify } from '../../../../utils/Notify';

@Component({
  selector: 'r1-tab',
  templateUrl: './r1-tab.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class R1TabComponent implements OnChanges {

  @Input() rdteData: RdteData;

  r1FileName:string;

  constructor(private libraryService:LibraryService) { }

  ngOnChanges() {

    if ( this.rdteData && this.rdteData.r1Name ){
      this.r1FileName = this.rdteData.r1Name;
    } else {
      this.r1FileName = "";
    }
  }

  r1HandleFileInput(files: FileList) {
    let r1FileToUpload:File = files.item(0);
    this.libraryService.uploadFile(r1FileToUpload, this.rdteData.fileArea).subscribe(response => {
      if (response.result) {
        this.rdteData.r1Id=response.result.id;
        this.rdteData.r1Name=r1FileToUpload.name;
        this.r1FileName = this.rdteData.r1Name;
        //console.log(this.rdteData);
      } else if (response.error) {
        Notify.error( "Something went wrong with the overview file upload" + response.error );
      } else {
        Notify.error( "Something went wrong with the overview file upload" );
      }
    });
  }

}
