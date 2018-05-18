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
      var ufrid = segments[segments.length - 1].path;
      console.log('ufrid: ' + ufrid);

      my.usvc.getUfrById(ufrid).subscribe(data => { 
        my.current = data.result;
        console.log(my.current);
      });
    });
  }    
}
