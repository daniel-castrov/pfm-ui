import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import * as $ from 'jquery';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'app-request-community',
  templateUrl: './request-community.component.html',
  styleUrls: ['./request-community.component.css']
})
export class RequestCommunityComponent implements OnInit {

    @ViewChild(HeaderComponent) header;

      public ngOnInit() {


        jQuery(document).ready(function($) {
            $('.multiselect').multiselect();
        });

      }

      title = 'Angular 4 with jquery';
        toggleTitle(){
          $('.title').slideToggle(); //
        }
    }
