import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FileResponse, LibraryService, POMService, ProgramsService, ShortyType, Tag, UFR } from '../../../../generated';
import {ProgramOrPrWithFullName, WithFullNameService} from "../../../../services/with-full-name.service";
import {DomSanitizer} from "@angular/platform-browser";
import {TagsService} from "../../../../services/tags.service";
import {forkJoin} from 'rxjs/observable/forkJoin';
import {Observable} from "rxjs";

@Component({
  selector: 'ufr-program-tab',
  templateUrl: './ufr-program-tab.component.html',
  styleUrls: ['./ufr-program-tab.component.scss']
})
export class UfrProgramComponent implements OnInit, OnChanges {
  @Input() editable: boolean = false;
  @Input() shorty: ProgramOrPrWithFullName;
  @Input() ufr: UFR;
  private tagNames = new Map<string, Map<string, string>>();
  private parentName: string;
  readonly fileArea = 'ufr';
  imagePath: string;

  constructor( private programService: ProgramsService,
               private pomService: POMService,
               private withFullNameService: WithFullNameService,
               private libraryService: LibraryService,
               private sanitization: DomSanitizer,
               private tagsService: TagsService ) {}

  ngOnInit() {
    this.initTagNames();
  }

  ngOnChanges() {
    this.initParentName();

    if (this.ufr.imageName) {
      this.libraryService.downloadFile(this.ufr.imageName, this.fileArea).subscribe(response => {
        if (response.result) {
          let fileResponse = response.result as FileResponse;
          let imagePath = 'data:'+ fileResponse.contentType +';base64,'  + fileResponse.content;
          this.imagePath = this.sanitization.bypassSecurityTrustResourceUrl(imagePath) as string;
        }
      });
    }
  }

  private async initTagNames() {
    const tagNames = (await this.programService.getTagtypes().toPromise()).result as string[];
    const observables: Observable<Tag[]>[] = tagNames.map( (tagType: string) => this.tagsService.tags(tagType) );
    const tags = await forkJoin(...observables).toPromise() as Tag[][];
    tagNames.forEach((tagName, idx) => {
      this.tagNames.set(tagName, new Map<string, string>());
      tags[idx].forEach((tag: Tag) => {
        this.tagNames.get(tagName).set(tag.abbr, tag.name);
      });
    });
  }

  private async initParentName() {
    if (this.shorty) {
      if (this.withFullNameService.isProgram(this.shorty)) {
        if(this.shorty.parentMrId) {
          this.parentName = (await this.programService.getFullName(this.shorty.parentMrId).toPromise()).result;
        }
      } else { // PR
        // not implemented
        this.parentName = "";
      }
    }
  }

  private ufrType(): string {
    if(this.ufr.shortyType == ShortyType.MRDB_PROGRAM) return "Program";
    if(this.ufr.shortyType == ShortyType.PR) return "Program";
    if(this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM || this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_PR) return "Increment";
    if(this.ufr.shortyType == ShortyType.NEW_FOS_FOR_MRDB_PROGRAM || this.ufr.shortyType == ShortyType.NEW_FOS_FOR_PR) return "FoS";
    if(this.ufr.shortyType == ShortyType.NEW_PROGRAM) return "Program";
  }

  private get disabled(): boolean {
    return this.ufr.shortyType == ShortyType.MRDB_PROGRAM || this.ufr.shortyType == ShortyType.PR;
  }

  invalid(): boolean {
    if(this.ufr.shortyType == ShortyType.MRDB_PROGRAM || this.ufr.shortyType == ShortyType.PR) return false;
    return !this.ufr.shortName || !this.ufr.longName;
  }

  onFileUploaded(fileResponse: FileResponse){
    let imagePath = 'data:'+ fileResponse.contentType +';base64,'  + fileResponse.content;
    this.imagePath = this.sanitization.bypassSecurityTrustResourceUrl(imagePath) as string;
    this.ufr.imageName = fileResponse.id;
    this.ufr.imageArea = this.fileArea;
  }
}
