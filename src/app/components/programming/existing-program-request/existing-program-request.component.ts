import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';


@Component({
  selector: 'existing-program-request',
  templateUrl: './existing-program-request.component.html',
  styleUrls: ['./existing-program-request.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProgramRequestComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
