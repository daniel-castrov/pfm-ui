import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import * as $ from 'jquery/dist/jquery.min.js';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})

export class RolesComponent {

  @ViewChild(HeaderComponent) header;

  status: any = {
    isFirstOpen: true,
    isFirstDisabled: false
  };

  public ngOnInit() {}

}
