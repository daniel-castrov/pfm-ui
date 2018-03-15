import { Component, OnInit, ViewChild } from '@angular/core';
import { ProgramsService, Program } from '../../../generated';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'program-view',
  templateUrl: './program-view.component.html',
  styleUrls: ['./program-view.component.css']
})
export class ProgramViewComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  private allprograms: Program[] = [];
  private current: Program = null;


  constructor(private programs: ProgramsService) {
  }

  ngOnInit() {
    this.programs.getall().subscribe(
      (data) => {
        this.allprograms = data.result;
        this.current = this.allprograms[0];
      }
    );
  }

}
