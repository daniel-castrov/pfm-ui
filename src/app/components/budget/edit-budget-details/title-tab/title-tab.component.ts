import { Component, OnChanges, Input } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import { Budget, PB, FileResponse, RdteData, LibraryService } from '../../../../generated';

@Component({
  selector: 'title-tab',
  templateUrl: './title-tab.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class TitleTabComponent implements OnChanges {

  @Input() scenario: PB;
  @Input() budget: Budget;
  @Input() rdteData: RdteData;
  @Input() editable: boolean;
  
  logoImagePath: string;
  
  constructor(
    private libraryService: LibraryService,
    private sanitization: DomSanitizer) { }

  ngOnChanges() {

    // Load the image if it exists
    if (this.rdteData && this.rdteData.logoId && this.rdteData.fileArea) {
      this.libraryService.downloadFile(this.rdteData.logoId, this.rdteData.fileArea).subscribe(response => {
        if (response.result) {
          let fileResponse = response.result as FileResponse;
          let imagePath = 'data:'+ fileResponse.contentType +';base64,'  + fileResponse.content;
          this.logoImagePath = this.sanitization.bypassSecurityTrustResourceUrl(imagePath) as string;
        }
      });
    } else {
      this.logoImagePath="";
    }
  } 

  onlogoUploaded(fileResponse: FileResponse){
    let imagePath = 'data:'+ fileResponse.contentType +';base64,'  + fileResponse.content;
    this.logoImagePath = this.sanitization.bypassSecurityTrustResourceUrl(imagePath) as string;
    this.rdteData.logoId=fileResponse.id;
  }

}