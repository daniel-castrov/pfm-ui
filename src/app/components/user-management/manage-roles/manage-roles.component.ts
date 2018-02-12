import { Component, OnInit, ViewChild } from '@angular/core';
import * as $ from 'jquery/dist/jquery.min.js';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

// Generated

@Component({
  selector: 'app-manage-roles',
  templateUrl: './manage-roles.component.html',
  styleUrls: ['./manage-roles.component.css']
})

export class ManageRolesComponent {

  @ViewChild(HeaderComponent) header;

  status: any = {
    isFirstOpen: true,
    isFirstDisabled: false
  };

  public ngOnInit() {}

}
