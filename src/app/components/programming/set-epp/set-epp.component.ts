import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'set-epp',
  templateUrl: './set-epp.component.html',
  styleUrls: ['./set-epp.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SetEppComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
