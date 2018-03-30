import { Component, OnInit, ViewChild }  from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../../components/header/header.component';

@Component({
  selector: 'select-request-dropdown',
  templateUrl: './select-request-dropdown.component.html',
  styleUrls: ['./select-request-dropdown.component.scss']
})
export class SelectRequestDropdownComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
