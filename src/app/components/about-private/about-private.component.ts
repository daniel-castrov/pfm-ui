import { Component, OnInit, ViewChild } from '@angular/core';

// Other Components
import { JHeaderComponent } from '../header/j-header/j-header.component';

@Component({
  selector: 'app-about-private',
  templateUrl: './about-private.component.html',
  styleUrls: ['./about-private.component.scss']
})
export class AboutPrivateComponent {

  @ViewChild(JHeaderComponent) header;

  resultError;

  constructor() {
    // This is a static page
  }

  ngOnInit() {
    this.resultError=this.header.resultError;
  }

}
