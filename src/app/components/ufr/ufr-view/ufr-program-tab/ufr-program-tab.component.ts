import {RestResult} from './../../../../generated/model/restResult';
import {join} from './../../../../utils/join';
import {Observable} from 'rxjs/Observable';
import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {POMService, Program, ProgrammaticRequest, ProgramsService, ShortyType, Tag, UFR} from '../../../../generated';
import {WithFullNameService} from "../../../../services/with-full-name.service";

@Component({
  selector: 'ufr-program-tab',
  templateUrl: './ufr-program-tab.component.html',
  styleUrls: ['./ufr-program-tab.component.scss']
})
export class UfrProgramComponent implements OnInit, OnChanges {
  @Input() editable: boolean = false;
  @Input() shorty: Program | ProgrammaticRequest;
  @Input() ufr: UFR;
  private tagNames = new Map<string, Map<string, string>>();
  private parentName: string;

  constructor( private programService: ProgramsService,
               private pomService: POMService,
               private withFullNameService: WithFullNameService ) {}

  ngOnInit() {
    this.initTagNames();
  }

  ngOnChanges() {
    this.initParentName();
  }

  private async initTagNames() {
    const tagNames = (await this.programService.getTagtypes().toPromise()).result as string[];
    const observables: Observable<RestResult>[] = tagNames.map( (tagType: string) => this.programService.getTagsByType(tagType) );
    const tags = await join(...observables) as Tag[][]
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

  private shortyType(): string {
    if (this.ufr.shortyType == ShortyType.NEW_PROGRAM) {
      return 'PROGRAM';
    } else {
      if (this.shorty) { // ag-grid somehow calls shortType() when the mouse hovers on the Funds tab, sometimes before shorty is initialized. Bad.
                         // More investigation is needed and a better fix is preferable
        return this.withFullNameService.isProgram(this.shorty) ? 'PROGRAM' : 'PROGRAM REQUEST';
      }
    }
  }

  private get disabled(): boolean {
    return this.ufr.shortyType == ShortyType.MRDB_PROGRAM || this.ufr.shortyType == ShortyType.PR;
  }

  invalid(): boolean {
    if(this.ufr.shortyType == ShortyType.MRDB_PROGRAM || this.ufr.shortyType == ShortyType.PR) return false;
    return !this.ufr.shortName || !this.ufr.longName;
  }

}
