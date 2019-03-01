import { Component, OnInit, ViewChild } from '@angular/core';
import { JHeaderComponent } from '../../../header/j-header/j-header.component';

@Component({
  selector: 'r4A',
  templateUrl: './r4-a.component.html',
  styleUrls: ['./r4-a.component.scss']
})
export class R4AComponent implements OnInit {

  @ViewChild(JHeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
