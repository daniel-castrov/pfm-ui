import { Component, OnChanges, Input } from '@angular/core';
import { Budget, PB, R0R1Data, LibraryService } from '../../../../generated';

@Component({
  selector: 'r1-tab',
  templateUrl: './r1-tab.component.html',
  styleUrls: ['../edit-budget-scenario.component.scss']
})
export class R1TabComponent implements OnChanges {

  @Input() scenario: PB;
  @Input() budget: Budget;
  @Input() r0r1data: R0R1Data;
  @Input() editable: boolean;

  r1FileName:string;

  constructor(private libraryService:LibraryService) { }

  ngOnChanges() {

    if ( this.r0r1data && this.r0r1data.r1Name ){
      this.r1FileName = this.r0r1data.r1Name;
    }
  }

  r1HandleFileInput(files: FileList) {
    let r1FileToUpload:File = files.item(0);
    this.libraryService.uploadFile(r1FileToUpload, this.r0r1data.fileArea).subscribe(response => {
      if (response.result) {
        this.r0r1data.r1Id=response.result.id;
        this.r0r1data.r1Name=r1FileToUpload.name;
        this.r1FileName = this.r0r1data.r1Name;
        console.log(this.r0r1data);
      } else if (response.error) {
        console.log( "Something went wrong with the overview file upload" );
        console.log( response.error );
      } else {
        console.log( "Something went wrong with the overview file upload" );
      }
    });
  }

}
