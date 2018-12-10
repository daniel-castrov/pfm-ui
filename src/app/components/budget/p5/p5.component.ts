import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';


@Component({
  selector: 'p5',
  templateUrl: './p5.component.html',
  styleUrls: ['./p5.component.scss']
})
export class P5Component implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
