import {CycleUtils} from './../../../services/cycle.utils';
import {Component, OnInit, ViewChild} from '@angular/core';
import {POMService, UFR, UFRsService} from '../../../generated';
import {HeaderComponent} from '../../header/header.component';
import {ActivatedRoute, UrlSegment} from '@angular/router';

@Component({
  selector: 'app-ufr-view',
  templateUrl: './ufr-view.component.html',
  styleUrls: ['./ufr-view.component.scss']
})
export class UfrViewComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private ufr: UFR;
  private canedit: boolean = false;
  private pomFy: number;

  constructor( private ufrService: UFRsService,
               private cycleUtils: CycleUtils,
               private route: ActivatedRoute,
               private pomService: POMService) {}

  async ngOnInit() {
    this.route.url.subscribe(async(urlSegments: UrlSegment[]) => { // don't try to convert this one to Promise -- it doesn't work
      const ufrId = urlSegments[urlSegments.length - 1].path;
      this.init(ufrId);
      this.canedit = !!await this.cycleUtils.currentPom().toPromise();
    });
  }

  private async init(ufrId: string) {
    this.ufr = (await this.ufrService.getUfrById(ufrId).toPromise()).result;
    this.pomFy = (await this.pomService.getById(this.ufr.phaseId).toPromise()).result.fy  - 2000;
  }

  save() {
    this.ufrService.update(this.ufr).subscribe();
  }

  submit() {
    this.ufr.status = 'SUBMITTED';
    this.save();
  }

  get ufrNumber(): string {
    const sequentialNumber = ('000' + this.ufr.requestNumber).slice(-3);
    return this.pomFy + sequentialNumber;
  }
}
