import { Component, OnInit, ViewChild } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'app-create-execution-phase',
  templateUrl: './create-execution-phase.component.html',
  styleUrls: ['./create-execution-phase.component.scss']
})
export class CreateExecutionPhaseComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
