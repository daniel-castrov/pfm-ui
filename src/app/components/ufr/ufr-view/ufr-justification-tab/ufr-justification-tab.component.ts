import { Component, OnInit, Input } from '@angular/core';
import { UFR } from '../../../../generated';

@Component({
  selector: 'ufr-justification-tab',
  templateUrl: './ufr-justification-tab.component.html',
  styleUrls: ['./ufr-justification-tab.component.scss']
})
export class UfrJustificationComponent implements OnInit {
  @Input() ufr: UFR;
  @Input() editable: boolean = false;
  
  constructor() { }

  ngOnInit() {
  }

}
