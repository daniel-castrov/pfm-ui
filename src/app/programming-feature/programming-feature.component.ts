import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-programming-feature',
  templateUrl: './programming-feature.component.html',
  styleUrls: ['./programming-feature.component.css']
})
export class ProgrammingFeatureComponent implements OnInit {
  busy: boolean;
  ready = true;

  constructor() {}

  ngOnInit() {}
}
