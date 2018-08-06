import { Component, OnInit, ViewChild } from '@angular/core'

// Other Components
import { HeaderComponent } from '../../../components/header/header.component'
import { Router } from '@angular/router'

@Component({
  selector: 'program-execution-line',
  templateUrl: './program-execution-line.component.html',
  styleUrls: ['./program-execution-line.component.scss']
})
export class ProgramExecutionLineComponent implements OnInit {
  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
