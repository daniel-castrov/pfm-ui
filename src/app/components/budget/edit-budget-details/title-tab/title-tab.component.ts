import { Component, OnChanges, Input } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import { Budget, PB, FileResponse, RdteData } from '../../../../generated';

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
  
  constructor(private sanitization: DomSanitizer) { }

  ngOnChanges() {
  } 

  onlogoUploaded(fileResponse: FileResponse){

    let imagePath = 'data:'+ fileResponse.contentType +';base64,'  + fileResponse.content;
    this.logoImagePath = this.sanitization.bypassSecurityTrustResourceUrl(imagePath) as string;
    this.rdteData.logoName=fileResponse.id;

    // console.log(this.rdteData);

  }

}