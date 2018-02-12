import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import * as $ from 'jquery';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'app-request-access-change',
  templateUrl: './request-access-change.component.html',
  styleUrls: ['./request-access-change.component.css']
})

export class RequestAccessChangeComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

    public ngOnInit() {

      jQuery(document).ready(function($) {
        $('#multiselect1').multiselect();
        $('#multiselect2').multiselect();
      });

    }
  }
