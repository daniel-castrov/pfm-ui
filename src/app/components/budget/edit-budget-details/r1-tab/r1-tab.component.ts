import { Component, OnChanges, Input } from '@angular/core';
import { Budget, PB, RdteData, LibraryService } from '../../../../generated';

@Component({
  selector: 'r1-tab',
  templateUrl: './r1-tab.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class R1TabComponent implements OnChanges {

  @Input() scenario: PB;
  @Input() budget: Budget;
  @Input() rdteData: RdteData;
  @Input() editable: boolean;

  r1FileName:string;

  constructor(private libraryService:LibraryService) { }

  ngOnChanges() {

    if ( this.rdteData && this.rdteData.r1Name ){
      this.r1FileName = this.rdteData.r1Name;
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
        console.log( "Something went wrong with the overview file upload" );
        console.log( response.error );
      } else {
        console.log( "Something went wrong with the overview file upload" );
      }
    });
  }

}
