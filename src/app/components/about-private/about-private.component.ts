import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-about-private',
  templateUrl: './about-private.component.html',
  styleUrls: ['./about-private.component.css']
})
export class AboutPrivateComponent implements AfterViewInit {

  @ViewChild(HeaderComponent) header: HeaderComponent;

  constructor() { }

  isloggedin: boolean;

  ngAfterViewInit() {
    this.isloggedin = true;
    // this.isloggedin = this.header.isloggedin;
    // this.isloggedin = this.header.isloggedin;
  }

}
