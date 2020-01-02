import { Component, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PluginLoaderService } from '../services/plugin-loader/plugin-loader.service';

@Component({
  selector: 'app-programming-feature',
  templateUrl: './programming-feature.component.html',
  styleUrls: ['./programming-feature.component.css']
})
export class ProgrammingFeatureComponent implements OnInit {


  busy:boolean;
  ready:boolean = true;//TODO get the common data that is needed by all of the child routes

  constructor() { }

  ngOnInit() {

  }

}
