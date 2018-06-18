import { Component, OnInit, ViewChild } from '@angular/core';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'app-create-execution-phase',
  templateUrl: './create-execution-phase.component.html',
  styleUrls: ['./create-execution-phase.component.scss']
})
export class CreateExecutionPhaseComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }


  ngOnInit() {
    var fn = function(e) {
			if (!/zmore/.test(e.target.className)) { $('#dmore').hide(); }
		}
		document.addEventListener('click', fn);
		document.addEventListener('touchstart', fn);


  }

}
