import { Component, OnInit, ViewChild } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css']
})
export class PlanningComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  // tabs: any[] = [
  //     {
  //       title: 'Build',
  //       content: 'Build',
  //       customClass: 'tabMenu'
  //     },
  //     {
  //       title: 'Verify',
  //       content: 'Verify',
  //       customClass: 'tabMenu'
  //     }
  //   ];

  constructor() { }

  ngOnInit() {
  }

  alertMe(): void {
  setTimeout(function(): void {
    alert("You've selected the alert tab!");
  });
}

}
