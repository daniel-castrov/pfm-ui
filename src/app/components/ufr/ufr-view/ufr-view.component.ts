import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ProgramsService, Program, ProgramFilter, UFR, UFRsService } from '../../../generated';
import { ViewEncapsulation } from '@angular/core';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { Router, ActivatedRoute, ParamMap, Params, UrlSegment } from '@angular/router';

import { Status } from '../status.enum';
import { Disposition } from '../disposition.enum';

@Component({
  selector: 'app-ufr-view',
  templateUrl: './ufr-view.component.html',
  styleUrls: ['./ufr-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UfrViewComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private current: UFR;

  constructor(private usvc: UFRsService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    var my: UfrViewComponent = this;
    this.route.url.subscribe((segments: UrlSegment[]) => {
      var pid = segments[segments.length - 1].path;

      my.current = {
        id: pid,
        phaseId: '5afc6ef882d7c8902e97c73d', // WARNING: this is super-fragile!
        costToComplete: 100,
        impactY: 'none',
        impactN: 'I don\'t know',
        cca: 'My core!',
        justification: 'Just because ;)',
        notes: 'some scribbled jibberish',
        number: 100 + Number.parseInt(pid),
        name: 'UFR named ' + pid,
        yoe: (Math.random() >= 0.5),

        status: Status[Math.floor(Math.random() * (Object.keys(Status).length / 2))],
        disposition: Disposition[Math.floor(Math.random() * (Object.keys(Disposition).length / 2))],
        tags: {
          'Core Capability Area': 'sausages',
          'Primary Capability': 'rolls',
          'Secondary Capability': 'hoagies',
          'Functional Area': 'hotdogs',
          'Medical Category': 'M',
          'NBC Category': 'O',
          'BSV National Strategy': 'Other',
          'Acquisition Type': 'Stomachs'          
        },
        funding: [{
          id: 'FL#1',
          appropriation: 'RDTE',
          blin: 'BA4',
          opAgency: 'CBDP',
          item: 'Item 666!',
          funds: { 2016: 100, 2017: 1000, 2018: 10000, 2019: 100000 },
          fy: 2018
        }]
      }

      // my.usvc.getUfrById(pid).subscribe(
      //   (data) => {
      //     my.current = data.result;
      //  });
    });
  }
}
