import { Component, OnInit, ViewChild } from '@angular/core';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

// Generated

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'app-manage-roles',
  templateUrl: './manage-roles.component.html',
  styleUrls: ['./manage-roles.component.scss']
})

export class ManageRolesComponent {

    @ViewChild(HeaderComponent) header;

      public ngOnInit() {

        jQuery(document).ready(function($) {
          $('#multiselect1').multiselect();
          // $('#multiselect2').multiselect();
        });

      }
    }
