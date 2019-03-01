import { Component, OnInit, ViewChild } from '@angular/core';
import { JHeaderComponent } from '../../../header/j-header/j-header.component';

@Component({
  selector: 'r2A',
  templateUrl: './r2-a.component.html',
  styleUrls: ['./r2-a.component.scss']
})
export class R2AComponent implements OnInit {

  @ViewChild(JHeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
