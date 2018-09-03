import { CycleUtils } from './../../../services/cycle.utils';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UFR, UFRsService } from '../../../generated';
import { HeaderComponent } from '../../header/header.component';
import { ActivatedRoute, UrlSegment } from '@angular/router';

@Component({
  selector: 'app-ufr-view',
  templateUrl: './ufr-view.component.html',
  styleUrls: ['./ufr-view.component.scss']
})
export class UfrViewComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private ufr: UFR;
  private canedit: boolean = false;

  constructor( private ufrService: UFRsService,
               private cycleUtils: CycleUtils,
               private route: ActivatedRoute ) {}

  async ngOnInit() {
    this.route.url.subscribe(async(urlSegments: UrlSegment[]) => { // don't try to convert this one to Promise -- it doesn't work
      const ufrId = urlSegments[urlSegments.length - 1].path;
      this.initUfr(ufrId);
      this.canedit = !!await this.cycleUtils.currentPom().toPromise();
    });
  }

  private async initUfr(ufrId: string) {
    this.ufr = (await this.ufrService.getUfrById(ufrId).toPromise()).result;
  }

  save() {
    this.ufrService.update(this.ufr).subscribe();
  }

  submit() {
    this.ufr.status = 'SUBMITTED';
    this.save();
  }
}
