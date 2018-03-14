import { Component, OnInit, Input } from '@angular/core';
import { Program } from '../../../generated';

@Component({
  selector: 'variants',
  templateUrl: './variants.component.html',
  styleUrls: ['./variants.component.css']
})
export class VariantsComponent implements OnInit {
  @Input() current: Program;

  constructor() { }

  ngOnInit() {
  }

}
