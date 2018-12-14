import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'r4',
  templateUrl: './r4.component.html',
  styleUrls: ['./r4.component.scss']
})
export class R4Component implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
