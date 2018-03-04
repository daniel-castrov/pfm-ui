import { Component, OnInit, ViewChild  } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'app-access-change-approval',
  templateUrl: './access-change-approval.component.html',
  styleUrls: ['./access-change-approval.component.css']
})
export class AccessChangeApprovalComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
