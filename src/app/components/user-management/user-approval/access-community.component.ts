import { Component, OnInit, ViewChild  } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'app-access-community',
  templateUrl: './access-community.component.html',
  styleUrls: ['./access-community.component.css']
})
export class AccessCommunityComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
