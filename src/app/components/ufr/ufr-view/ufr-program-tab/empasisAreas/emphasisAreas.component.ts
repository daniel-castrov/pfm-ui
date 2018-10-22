import {TagsService, TagType} from './../../../../../services/tags.service';
import {Component, Input, OnChanges} from '@angular/core';
import {ProgrammaticRequest, Tag, UFR} from '../../../../../generated';

interface TagWithPercent extends Tag {
  percent: number;
}

type UfrOrPr = UFR | ProgrammaticRequest;

@Component({
  selector: 'emphasisAreas',
  templateUrl: './emphasisAreas.component.html',
  styleUrls: ['./emphasisAreas.component.scss']
})
export class EmphasisAreasComponent implements OnChanges {
  @Input() ufrOrPr: UfrOrPr;
  @Input() disabled: boolean;
  tagsWithPercent: TagWithPercent[];

  constructor( private tagsService: TagsService ) {}

  async ngOnChanges() {
    if(this.ufrOrPr && this.ufrOrPr.emphases) {
      const tags: Tag[] = await this.tagsService.tags(TagType.EMPHASIS_AREA).toPromise();
      this.tagsWithPercent = tags.map(tag => {
        return {...tag, percent: this.percentFromUfrOrPr(tag.abbr)}
      });
    }
  }

  percentFromUfrOrPr(abbr: string): number {
    const area:string = this.ufrOrPr.emphases.find( area =>  area.substring(0, area.indexOf(',')) == abbr);
    if(area) {
      return +area.substring(area.indexOf(',')+1);
    } else {
      return 0;
    }
  }

  nameWithPercent(tagWithPercent: TagWithPercent): string {
    if(tagWithPercent.percent) {
      return tagWithPercent.name + ' ' + tagWithPercent.percent + '%';
    } else {
      return tagWithPercent.name;
    }
  }

  clickOnOption(abbr: string) {
    const tagWithPercent = this.tagsWithPercent.find(tag => tag.abbr == abbr);
    tagWithPercent.percent = tagWithPercent.percent>0 ? tagWithPercent.percent -= 25 : 100;

    this.ufrOrPr.emphases = [];
    this.tagsWithPercent.forEach( tagWithPercent => {
      if (tagWithPercent.percent > 0) {
        this.ufrOrPr.emphases.push(tagWithPercent.abbr + ',' + tagWithPercent.percent);
      }
    });
  }

}
