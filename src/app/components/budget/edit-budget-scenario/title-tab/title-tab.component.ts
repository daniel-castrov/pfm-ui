import { Component, OnChanges, Input } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import { Budget, PB, FileResponse, R0R1Data } from '../../../../generated';

@Component({
  selector: 'title-tab',
  templateUrl: './title-tab.component.html',
  styleUrls: ['../edit-budget-scenario.component.scss']
})
export class TitleTabComponent implements OnChanges {

  @Input() scenario: PB;
  @Input() budget: Budget;
  @Input() r0r1data: R0R1Data;
  @Input() editable: boolean;
  
  logoImagePath: string;
  
  constructor(private sanitization: DomSanitizer) { }

  ngOnChanges() {
  } 

  onlogoUploaded(fileResponse: FileResponse){

    let imagePath = 'data:'+ fileResponse.contentType +';base64,'  + fileResponse.content;
    this.logoImagePath = this.sanitization.bypassSecurityTrustResourceUrl(imagePath) as string;
    this.r0r1data.logoName=fileResponse.id;

    // console.log(this.r0r1data);

  }

}