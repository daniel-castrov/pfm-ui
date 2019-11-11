import { Component, OnInit } from '@angular/core';
import { AppModel } from '../../../../projects/shared/src/lib/models/AppModel';

@Component({
  selector: 'pfm-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {

  constructor(public appModel:AppModel) { }

  ngOnInit() {
  }

}
