import {TagsService, TagType} from './../../../../services/tags.service';
import {CycleUtils} from './../../../../services/cycle.utils';
import {Component, Input, OnInit} from '@angular/core';
import {Disposition, Tag, UFR, UfrStatus} from '../../../../generated';


@Component({
  selector: 'ufr-ufr-tab',
  templateUrl: './ufr-ufr-tab.component.html',
  styleUrls: ['./ufr-ufr-tab.component.scss']
})
export class UfrUfrTabComponent implements OnInit {
  @Input() ufr: UFR;
  @Input() editable: boolean = false;

  private statuses = Object.keys(UfrStatus) as string[];
  private dispositions = Object.keys(Disposition) as string[];
  private cycles: {}[];
  private capabilities: Tag[];

  constructor( private cycleUtils: CycleUtils, 
               private tagsService: TagsService ) {}

  ngOnInit() {
    this.initCycles();
    this.initCapabilities();
  }

  private async initCycles() {
    this.cycles = (await this.cycleUtils.poms().toPromise())
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
