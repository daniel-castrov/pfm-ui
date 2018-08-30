import { Component, OnInit, Input } from '@angular/core';
import { UFR } from '../../../../generated';

@Component({
  selector: 'ufr-justification',
  templateUrl: './ufr-justification.component.html',
  styleUrls: ['./ufr-justification.component.scss']
})
export class UfrJustificationComponent implements OnInit {
  @Input() current: UFR;
  @Input() editable: boolean = false;
  
  constructor() { }

  ngOnInit() {
  }

}
