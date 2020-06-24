import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-execution-feature',
  templateUrl: './execution-feature.component.html',
  styleUrls: ['./execution-feature.component.css']
})
export class ExecutionFeatureComponent implements OnInit {
  busy: boolean;
  ready = true;

  constructor() {}

  ngOnInit(): void {}
}
