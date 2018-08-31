import { RestResult } from './../../../../generated/model/restResult';
import { join } from './../../../../utils/join';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Input } from '@angular/core';
import { ProgramsService, Tag, UFR } from '../../../../generated';

@Component({
  selector: 'ufr-program-tab',
  templateUrl: './ufr-program-tab.component.html',
  styleUrls: ['./ufr-program-tab.component.scss']
})
export class UfrProgramComponent implements OnInit {
  @Input() ufr: UFR;
  @Input() editable: boolean = false;
  private tagNames = new Map<string, Map<string, string>>();
  private parentName: string;

  constructor( private programService: ProgramsService ) {}

  ngOnInit() {
    this.initTagNames();
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

  private initParentName() {
    if (this.ufr.parentMrId) {
      this.programService.getFullName(this.ufr.parentMrId).subscribe(data => {
        this.parentName = data.result;
      });
    }
  }

}
