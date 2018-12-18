import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'r4A',
  templateUrl: './r4-a.component.html',
  styleUrls: ['./r4-a.component.scss']
})
export class R4AComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
