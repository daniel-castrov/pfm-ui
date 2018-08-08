import { GlobalsService } from './../../../../services/globals.service';
import {Component, Input, OnChanges} from '@angular/core';
import {FileResponse, LibraryService, ProgrammaticRequest, Tag} from '../../../../generated';
import {DomSanitizer} from '@angular/platform-browser';


@Component({
  selector: 'program-tab',
  templateUrl: './program-tab.component.html',
  styleUrls: ['./program-tab.component.scss']
})
export class ProgramTabComponent implements OnChanges {
  @Input() pr: ProgrammaticRequest;
  readonly fileArea = 'pr';
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
    'Emphasis Areas'];

  readonly mapTypeToTags = new Map<string, Tag[]>();

  *prFieldsGenerator() { // must match 'tagTypes: string[]'
    yield this.pr.leadComponent;
    yield this.pr.manager;
    yield this.pr.primaryCapability;
    yield this.pr.coreCapability;
    yield this.pr.secondaryCapability;
    yield this.pr.functionalArea;
    yield this.pr.medicalArea;
    yield null;  // this field is not fully implemented
    return null; // this field is not fully implemented
  }

  constructor(private globalsService: GlobalsService,
              private libraryService: LibraryService,
              private sanitization: DomSanitizer) {}

  ngOnChanges() {
    this.createMismatchingTags();

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

  private createMismatchingTags() {
    const prFields: IterableIterator<string> = this.prFieldsGenerator();
    this.tagTypes.forEach(async (tagType) => {
      const prField: string = prFields.next().value;
      const tags: Tag[] = await this.globalsService.tags(tagType).toPromise();
      this.mapTypeToTags.set(tagType, tags);
      this.createMismatchingTagIfNeeded(tags, tagType, prField);
    });
  }

  private createMismatchingTagIfNeeded(tags: Tag[], tagType: string, prField: string) {
    if (prField && this.tagAbbreviationIsNotFoundInTagAbbreviations(prField, tags)) {
      const mismatchingTag = { abbr: prField, name: prField + ' (expanded name unavailable)' };
      this.mapTypeToTags.get(tagType).push(mismatchingTag);
    }
  }

  private tagAbbreviationIsNotFoundInTagAbbreviations(tagAbbreviation: string, tags: Tag[]) {
    const tagAbbreviations = new Set(tags.map(tag => tag.abbr));
    return !tagAbbreviations.has(tagAbbreviation);
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
