import { Component, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PluginLoaderService } from '../services/plugin-loader/plugin-loader.service';
import { DialogService } from '../pfm-coreui/services/dialog.service';
import { PlanningService } from './services/planning-service';
import { PlanningPhase } from './models/PlanningPhase';
import { AppModel } from '../pfm-common-models/AppModel';
import { PlanningUtils } from './utils/planning-utils';

@Component({
  selector: 'app-planning-feature',
  templateUrl: './planning-feature.component.html',
  styleUrls: ['./planning-feature.component.css']
})
export class PlanningFeatureComponent implements OnInit {

  busy:boolean;
  ready:boolean;

  constructor(private appModel:AppModel, private planningService:PlanningService, private dialogService:DialogService, ) { }

  ngOnInit() {
    this.planningService.getAllPlanning().subscribe(
      resp => {
        this.busy = false;
        this.processPlanningData(resp.result as any);
        this.ready = true;
      },
      error =>{
        this.busy = false;
        this.dialogService.displayDebug(error);
      });
  }

  private processPlanningData(data:any):void{
    this.appModel.planningData = PlanningUtils.processPlanningPhase(data);
  }
}

