import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../../header/header.component';

@Component({
  selector: 'r2A',
  templateUrl: './r2-a.component.html',
  styleUrls: ['./r2-a.component.scss']
})
export class R2AComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
