import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../../header/header.component';

@Component({
  selector: 'r2',
  templateUrl: './r2.component.html',
  styleUrls: ['./r2.component.scss']
})
export class R2Component implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
