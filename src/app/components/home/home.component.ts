import { Component, ViewChild } from '@angular/core';

// Other Components
import { JHeaderComponent } from '../header/j-header/j-header.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  @ViewChild(JHeaderComponent) header: JHeaderComponent;

}
