import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';


@Component({
  selector: 'p40',
  templateUrl: './p40.component.html',
  styleUrls: ['./p40.component.scss']
})
export class P40Component implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
