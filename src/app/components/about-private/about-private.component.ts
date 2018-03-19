import { Component, OnInit, ViewChild } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-about-private',
  templateUrl: './about-private.component.html',
  styleUrls: ['./about-private.component.css']
})
export class AboutPrivateComponent {

  @ViewChild(HeaderComponent) header;

  resultError;

  constructor() {
    // This is a static page
  }

  ngOnInit() {
    this.resultError=this.header.resultError;
  }

}
