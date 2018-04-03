import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ProgramsService, Program, ProgramFilter } from '../../../generated';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { Router, ActivatedRoute, ParamMap, Params, UrlSegment } from '@angular/router';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'program-view',
  templateUrl: './program-view.component.html',
  styleUrls: ['./program-view.component.css']
})
export class ProgramViewComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  private current: Program = null;
  private startyear: number = 2013;

  constructor(private programs: ProgramsService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    var my: ProgramViewComponent = this;
    this.route.url.subscribe((segments: UrlSegment[]) => { 
      var pid = segments[segments.length - 1].path;
      my.programs.getProgramById(pid).subscribe(
        (data) => {
          my.current = data.result;
        });
    });
  }
}