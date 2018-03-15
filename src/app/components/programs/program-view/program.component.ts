import { Component, OnInit, Input } from '@angular/core';
import { Program } from '../../../generated';

@Component({
  selector: 'program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.css']
})
export class ProgramComponent implements OnInit {
  @Input() current: Program;
  @Input() startyear: number;

  constructor() {
  }

  ngOnInit() {
  }
}
