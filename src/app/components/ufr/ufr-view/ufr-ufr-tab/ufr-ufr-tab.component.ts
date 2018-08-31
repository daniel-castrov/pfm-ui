import { TagsService } from './../../../../services/tags.service';
import { CycleUtils } from './../../../../services/cycle.utils';
import { Component, OnInit, Input } from '@angular/core';
import { UFR, Tag } from '../../../../generated';
import { Status } from '../../status.enum';
import { Disposition } from '../../disposition.enum';


@Component({
  selector: 'ufr-ufr-tab',
  templateUrl: './ufr-ufr-tab.component.html',
  styleUrls: ['./ufr-ufr-tab.component.scss']
})
export class UfrUfrTabComponent implements OnInit {
  @Input() ufr: UFR;
  @Input() editable: boolean = false;

  private statuses = Object.keys(Status).filter(k => typeof Status[k] === "number") as string[];
  private dispositions = Object.keys(Disposition).filter(k => typeof Disposition[k] === "number") as string[];
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
    this.capabilities = await this.tagsService.tags('Core Capability Area').toPromise();
  }

}
