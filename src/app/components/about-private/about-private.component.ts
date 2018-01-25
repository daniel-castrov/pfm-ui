import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-about-private',
  templateUrl: './about-private.component.html',
  styleUrls: ['./about-private.component.css']
})
export class AboutPrivateComponent {

  @ViewChild(HeaderComponent) header;

  constructor() {
    // This is a static page
  }

  ngOnInit() {
  }

}
