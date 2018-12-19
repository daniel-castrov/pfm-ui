import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../../header/header.component';

@Component({
  selector: 'p21',
  templateUrl: './p21.component.html',
  styleUrls: ['./p21.component.scss']
})
export class P21Component implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
