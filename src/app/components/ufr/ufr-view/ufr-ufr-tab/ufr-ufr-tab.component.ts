import {TagsService, TagType} from './../../../../services/tags.service';
import {Component, Input, OnInit} from '@angular/core';
import {Disposition, POMService, Tag, UFR, UfrStatus} from '../../../../generated';


@Component({
  selector: 'ufr-ufr-tab',
  templateUrl: './ufr-ufr-tab.component.html',
  styleUrls: ['./ufr-ufr-tab.component.scss']
})
export class UfrUfrTabComponent implements OnInit {
  @Input() ufr: UFR;
  @Input() editable: boolean = false;
  @Input() readonly: boolean;

  private statuses = Object.keys(UfrStatus) as string[];
  private dispositions = Object.keys(Disposition) as string[];
  private cycles: {}[];
  private capabilities: Tag[];

  constructor( private pomService: POMService,
               private tagsService: TagsService ) {}

  ngOnInit() {
    this.initCycles();
    this.initCapabilities();
  }

  private async initCycles() {
    this.cycles = (await this.pomService.getAll().toPromise()).result
                      .map( pom => ({ display: 'POM ' + (pom.fy-2000),
                                      pomid: pom.id }) );
  }

  private async initCapabilities() {
    this.capabilities = await this.tagsService.tags(TagType.CORE_CAPABILITY_AREA).toPromise();
  }

  invalid(): boolean {
    return !this.ufr.ufrName || !this.ufr.description || !this.ufr.costLeft;
  }
}
