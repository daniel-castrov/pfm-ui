import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FileResponse, LibraryService, POMService, Program, ShortyType, Tag, TagsService, UFR} from '../../../../generated';
import {ProgramAndPrService} from '../../../../services/program-and-pr.service';
import {DomSanitizer} from '@angular/platform-browser';
import {TagsUtils, TagType} from '../../../../services/tags-utils.service';
import {Observable} from 'rxjs';
import {NameUtils} from '../../../../utils/NameUtils';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'ufr-program-tab',
  templateUrl: './ufr-program-tab.component.html',
  styleUrls: ['./ufr-program-tab.component.scss']
})
export class UfrProgramComponent implements OnInit, OnChanges {
  @Input() editable: boolean = false;
  @Input() shorty: Program;
  @Input() ufr: UFR;
  @Input() readonly: boolean;

  private tagNames = new Map<string, Map<string, string>>();
  readonly fileArea = 'ufr';
  imagePath: string;

  constructor( private tagsService: TagsService,
               private pomService: POMService,
               private programAndPrService: ProgramAndPrService,
               private libraryService: LibraryService,
               private sanitization: DomSanitizer,
               private tagsUtils: TagsUtils ) {}

  ngOnInit() {
    this.initTagNames();
  }

  ngOnChanges() {
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
    const tagNames = (await this.tagsService.getTagtypes().toPromise()).result as string[];
    const observables: Observable<Tag[]>[] = tagNames.map( (tagType: TagType) => this.tagsUtils.tags(tagType) );
    const tags = await forkJoin(...observables).toPromise() as Tag[][];
    tagNames.forEach((tagName, idx) => {
      this.tagNames.set(tagName, new Map<string, string>());
      tags[idx].forEach((tag: Tag) => {
        this.tagNames.get(tagName).set(tag.abbr, tag.name);
      });
    });
  }

  set childNameModel(childName: string) {
    this.ufr.shortName = NameUtils.createShortName(NameUtils.getParentName(this.ufr.shortName), childName);
  }

  get childNameModel() {
    if(!this.ufr.shortName) return "";
    return NameUtils.getChildName(this.ufr.shortName);
  }

  get parentFullName() {
    if(!this.ufr.shortName) return "";
    return NameUtils.getParentName(this.ufr.shortName);
  }

  private ufrType(): string {
    if(this.ufr.shortyType == ShortyType.MRDB_PROGRAM) return "Program";
    if(this.ufr.shortyType == ShortyType.PR) return "Program";
    if(this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM || this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_PR) return "Increment";
    if(this.ufr.shortyType == ShortyType.NEW_FOS_FOR_MRDB_PROGRAM || this.ufr.shortyType == ShortyType.NEW_FOS_FOR_PR) return "FoS";
    if(this.ufr.shortyType == ShortyType.NEW_PROGRAM) return "Program";
  }

  public get disabled(): boolean {
    return this.ufr.shortyType == ShortyType.MRDB_PROGRAM || this.ufr.shortyType == ShortyType.PR || this.readonly;
  }

  invalid(): boolean {
    if(this.ufr.shortyType == ShortyType.MRDB_PROGRAM || this.ufr.shortyType == ShortyType.PR) return false;

    if(!this.ufr.leadComponent || !this.ufr.manager || !this.ufr.primaryCapability || !this.ufr.coreCapability || !this.ufr.functionalArea) {
      return true;
    }

    return !this.ufr.shortName || !this.ufr.longName;
  }

  onFileUploaded(fileResponse: FileResponse){
    let imagePath = 'data:'+ fileResponse.contentType +';base64,'  + fileResponse.content;
    this.imagePath = this.sanitization.bypassSecurityTrustResourceUrl(imagePath) as string;
    this.ufr.imageName = fileResponse.id;
    this.ufr.imageArea = this.fileArea;
  }
}
