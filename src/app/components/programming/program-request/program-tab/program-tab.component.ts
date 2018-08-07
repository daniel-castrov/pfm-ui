import { GlobalsService } from './../../../../services/globals.service';
import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FileResponse, LibraryService, ProgrammaticRequest, Tag} from "../../../../generated";
import {DomSanitizer} from '@angular/platform-browser';


@Component({
  selector: 'program-tab',
  templateUrl: './program-tab.component.html',
  styleUrls: ['./program-tab.component.scss']
})
export class ProgramTabComponent implements OnInit, OnChanges {
  @Input() pr : ProgrammaticRequest;
  readonly fileArea= 'pr';
  imagePath: string;

  readonly tagTypes: string[] = 
  ['Lead Component',
    'Manager',
    'Primary Capability',
    'Core Capability Area',
    'Secondary Capability',
    'Functional Area',
    'Medical Category',
    'DASD CBD',
    'Emphasis Areas'
  ];

  readonly mapTypeToTags = new Map<string, Tag[]>();

  constructor(private globalsService: GlobalsService,
              private libraryService: LibraryService,
              private sanitization: DomSanitizer) {}

  ngOnInit() {
    this.tagTypes.forEach(tagType => 
      this.globalsService.tags(tagType).subscribe((tags: Tag[]) => 
        this.mapTypeToTags.set(tagType, tags)
      )
    );
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

  get invalid(): boolean {
    return !this.pr.leadComponent || !this.pr.manager || !this.pr.primaryCapability || !this.pr.coreCapability || !this.pr.functionalArea;
  }  
}
