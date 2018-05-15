import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ProgramsService, Program, ProgramFilter, UFR, UFRsService } from '../../../generated';
import { ViewEncapsulation } from '@angular/core';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { Router, ActivatedRoute, ParamMap, Params, UrlSegment } from '@angular/router';

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
        id: "0",
        number: 100,
        name: 'UFR named 0',
        yoe: (Math.random() >= 0.5),
        status: (Math.random() >= 0.5 ? "Partially Approved" : 'Approved'),
        disposition: (Math.random() >= 0.5 ? "DRAFT" : 'OUTSTANDING'),
        lastmod: new Date().getTime(),
        created: new Date().getTime() - 60000
      }

      // my.usvc.getUfrById(pid).subscribe(
      //   (data) => {
      //     my.current = data.result;
      //  });
    });
  }
}
