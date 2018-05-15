import { Component, OnInit, Input } from '@angular/core';
import { Program, FundingLine, IntMap, UFR } from '../../../generated';

@Component({
  selector: 'ufr-funds',
  templateUrl: './ufr-funds.component.html',
  styleUrls: ['./ufr-funds.component.scss']
})
export class UfrFundsComponent implements OnInit {
  @Input() current: UFR;
    
  constructor() { }

  ngOnInit() {
  }

}
