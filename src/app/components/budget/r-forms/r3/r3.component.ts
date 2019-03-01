import { Component, OnInit, ViewChild } from '@angular/core';
import { JHeaderComponent } from '../../../header/j-header/j-header.component';

@Component({
  selector: 'r3',
  templateUrl: './r3.component.html',
  styleUrls: ['./r3.component.scss']
})
export class R3Component implements OnInit {

  @ViewChild(JHeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
