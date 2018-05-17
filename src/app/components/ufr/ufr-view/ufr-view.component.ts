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
        milestoneImpact: 'none',
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
          funds: { 2016: 100, 2017: 1000, 2018: 10000, 2019: 100000, 2020: 999999, 2021: 99999, 2022: 9999, 2023: 999 },
          fy: 2018,
          variants: [{
            shortName: 'shorty',
            longName: 'longy',
            description: 'vdesc',
            branch: 'USN',
            contractor: 'Lockheed',
            quantity: { 2018: 5, 2019: 10, 2020: 11 },
            unitCost: 19
          }]
        },
        {
          id: 'FL#2',
          appropriation: 'RDTE',
          blin: 'BA7',
          opAgency: 'CBDP',
          item: 'Item 667!',
          funds: { 2016: 200, 2017: 2000, 2018: 20000, 2019: 200000, 2020: 19999, 2021: 1999, 2022: 199, 2023: 19 },
          fy: 2018
        }
        ]
      };

      // my.usvc.getUfrById(pid).subscribe(
      //   (data) => {
      //     my.current = data.result;
      //  });
    });
  }    
}
