import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../../header/header.component';

@Component({
  selector: 'p5a',
  templateUrl: './p5a.component.html',
  styleUrls: ['./p5a.component.scss']
})
export class P5aComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
