import { Component, OnInit, Input } from '@angular/core';
import { UFR } from '../../../generated';

@Component({
  selector: 'ufr-tab',
  templateUrl: './ufr-tab.component.html',
  styleUrls: ['./ufr-tab.component.scss']
})
export class UfrTabComponent implements OnInit {
  @Input() current: UFR;
  
  constructor() { }

  ngOnInit() {
  }

}
