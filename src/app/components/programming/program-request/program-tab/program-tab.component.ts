import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FileResponse, LibraryService, ProgrammaticRequest} from "../../../../generated";
import {ProgramsService} from "../../../../generated/api/programs.service";

import {DomSanitizer} from '@angular/platform-browser';


@Component({
  selector: 'program-tab',
  templateUrl: './program-tab.component.html',
  styleUrls: ['./program-tab.component.scss']
})
export class ProgramTabComponent implements OnInit, OnChanges {
  @Input()
  pr : ProgrammaticRequest;

  fileArea: string = 'pr';
  imagePath: string;

  tags = ['Lead Component',
    'Manager',
    'Primary Capability',
    'Core Capability Area',
    'Secondary Capability',
    'Functional Area',
    'Medical Category',
    'DASD CBD',
    'Emphasis Areas'
  ];

  dropdownValues= new Map();

  constructor(private programsService: ProgramsService,
              private libraryService: LibraryService,
              private sanitization: DomSanitizer) { }

  ngOnInit() {
    this.tags.forEach(tag => {
      this.programsService.getTagsByType(tag).subscribe(data => {
        this.dropdownValues.set(tag, data.result);
      })
    });
  }

  ngOnChanges() {
    if (this.pr.imageName) {
      this.libraryService.downloadFile(this.pr.imageName, this.fileArea).subscribe(response => {
        if (response.result) {
          let fileResponse = response.result as FileResponse;
          let imagePath = 'data:'+ fileResponse.contentType +';base64,'  + fileResponse.content;
          this.imagePath = this.sanitization.bypassSecurityTrustResourceUrl(imagePath) as string;
        }
      });
    }
  }

  onFileUploaded(fileResponse: FileResponse){
    let imagePath = 'data:'+ fileResponse.contentType +';base64,'  + fileResponse.content;
    this.imagePath = this.sanitization.bypassSecurityTrustResourceUrl(imagePath) as string;
    this.pr.imageName = fileResponse.id;
    this.pr.imageArea = this.fileArea;
  }
}
