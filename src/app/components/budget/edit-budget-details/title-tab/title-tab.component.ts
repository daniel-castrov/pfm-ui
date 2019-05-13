import {Component, Input, OnChanges} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {FileResponse, LibraryService, RdteBudgetData} from '../../../../generated';

@Component({
  selector: 'title-tab',
  templateUrl: './title-tab.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class TitleTabComponent implements OnChanges {

  @Input() rdteBudgetData: RdteBudgetData;
  
  logoImagePath: string;
  
  constructor(
    private libraryService: LibraryService,
    private sanitization: DomSanitizer) { }

  ngOnChanges() {

    // Load the image if it exists
    if (this.rdteBudgetData && this.rdteBudgetData.logoId && this.rdteBudgetData.fileArea) {
      this.libraryService.downloadFile(this.rdteBudgetData.logoId, this.rdteBudgetData.fileArea).subscribe(response => {
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
    this.rdteBudgetData.logoId=fileResponse.id;
  }

}
