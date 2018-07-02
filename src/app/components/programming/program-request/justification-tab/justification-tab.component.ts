import {Component, Input, OnInit} from '@angular/core';
import {ProgrammaticRequest} from "../../../../generated";

@Component({
  selector: 'justification-tab',
  templateUrl: './justification-tab.component.html',
  styleUrls: ['./justification-tab.component.scss']
})
export class JustificationTabComponent implements OnInit {

  @Input()
  pr : ProgrammaticRequest;

  constructor() { }

  ngOnInit() {
  }

}
