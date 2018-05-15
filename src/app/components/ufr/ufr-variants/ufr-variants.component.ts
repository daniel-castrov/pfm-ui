import { Component, OnInit, Input } from '@angular/core';
import { Program, FundingLine, IntMap, UFR } from '../../../generated';

@Component({
  selector: 'ufr-variants',
  templateUrl: './ufr-variants.component.html',
  styleUrls: ['./ufr-variants.component.scss']
})
export class UfrVariantsComponent implements OnInit {
  @Input() current: UFR;

  constructor() { }

  ngOnInit() {
  }

}
