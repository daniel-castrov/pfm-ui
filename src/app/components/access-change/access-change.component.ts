import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import * as $ from 'jquery';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'app-access-change',
  templateUrl: './access-change.component.html',
  styleUrls: ['./access-change.component.css']
})

export class AccessChangeComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

    public ngOnInit() {

      jQuery(document).ready(function($) {
        $('#multiselect1').multiselect();
        $('#multiselect2').multiselect();
      });

    }
  }
