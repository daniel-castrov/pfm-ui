import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pfm-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  busy: boolean;
  ready = true;

  constructor() {}

  ngOnInit() {}
}
