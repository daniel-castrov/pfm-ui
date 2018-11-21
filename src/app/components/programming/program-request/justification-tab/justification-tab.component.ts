import {Component, Input, OnInit} from '@angular/core';
import {ProgrammaticRequest, Pom} from "../../../../generated";

@Component({
  selector: 'justification-tab',
  templateUrl: './justification-tab.component.html',
  styleUrls: ['./justification-tab.component.scss']
})
export class JustificationTabComponent implements OnInit {

  @Input() pr: ProgrammaticRequest;
  @Input() pom: Pom;

  constructor() { }

  ngOnInit() {
  }

  @Input() get readonly(): boolean {
    return (this.pom ? Pom.StatusEnum.RECONCILIATION === this.pom.status : false);
  }
}
