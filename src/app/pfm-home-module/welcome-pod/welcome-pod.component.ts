import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pfm-welcome-pod',
  templateUrl: './welcome-pod.component.html',
  styleUrls: ['./welcome-pod.component.scss']
})
export class WelcomePodComponent implements OnInit {

  @Input() fullName:string;

  constructor() { }

  ngOnInit() {
  }

}
