import { Component, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ProgrammingModel } from '../models/ProgrammingModel';
import { PluginLoaderService } from '../../services/plugin-loader/plugin-loader.service';

@Component({
  selector: 'pfm-programming',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
  busy:boolean;

  constructor() {
  }

  ngOnInit() {
  }
}
