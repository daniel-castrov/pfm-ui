import { Component, OnInit, ViewChild, Input } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'program-search',
  templateUrl: './program-search.component.html',
  styleUrls: ['./program-search.component.scss']
})
export class ProgramSearchComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
