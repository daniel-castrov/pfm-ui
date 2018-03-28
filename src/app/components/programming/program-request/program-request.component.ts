import { Component, OnInit, ViewChild, Input } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';


@Component({
  selector: 'program-request',
  templateUrl: './program-request.component.html',
  styleUrls: ['./program-request.component.scss']
})
export class ProgramRequestComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
