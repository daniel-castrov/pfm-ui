import { Component, OnInit } from '@angular/core';
import { ProgrammingModel } from '../models/ProgrammingModel';

@Component({
  selector: 'pfm-programming',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
  busy:boolean;

  constructor(private programmingModel: ProgrammingModel) {
  }

  ngOnInit() {
  }
}
