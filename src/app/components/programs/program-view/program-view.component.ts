import { Component, OnInit, ViewChild } from '@angular/core';
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


  constructor() { }

  ngOnInit() {
  }

}
