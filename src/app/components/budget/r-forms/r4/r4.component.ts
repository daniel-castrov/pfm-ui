import { Component, OnInit, ViewChild } from '@angular/core';
import { JHeaderComponent } from '../../../header/j-header/j-header.component';

@Component({
  selector: 'r4',
  templateUrl: './r4.component.html',
  styleUrls: ['./r4.component.scss']
})
export class R4Component implements OnInit {

  @ViewChild(JHeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
