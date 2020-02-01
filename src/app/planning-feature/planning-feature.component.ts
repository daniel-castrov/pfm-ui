import { Component, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PluginLoaderService } from '../services/plugin-loader/plugin-loader.service';
import { DialogService } from '../pfm-coreui/services/dialog.service';
import { PlanningService } from './services/planning-service';
import { PlanningPhase } from './models/PlanningPhase';
import { AppModel } from '../pfm-common-models/AppModel';
import { PlanningUtils } from './utils/planning-utils';
import { ProgrammingModel } from '../programming-feature/models/ProgrammingModel';
import { Route } from '@angular/router';

@Component({
  selector: 'app-planning-feature',
  templateUrl: './planning-feature.component.html',
  styleUrls: ['./planning-feature.component.css']
})
export class PlanningFeatureComponent implements OnInit {
  @ViewChild('targetRef', { read: ViewContainerRef, static: true }) vcRef: ViewContainerRef;

  busy:boolean;
  ready:boolean;

  constructor(private router: Route, private appModel:AppModel, private planningService:PlanningService, private dialogService:DialogService, private injector: Injector, private pluginLoader: PluginLoaderService) { }

  ngOnInit() {
      this.loadPlugin("programming-request");

    this.planningService.getAllPlanning().subscribe(
      resp => {
        this.busy = false;
        this.processPlanningData((resp as any).result);
        this.ready = true;
      },
      error =>{
        this.busy = false;
        this.dialogService.displayDebug(error);
      });
  }

  loadPlugin(pluginName: string) {
    this.pluginLoader.load( pluginName ).then( moduleFactory => {
      const moduleRef = moduleFactory.create( this.injector );
      const entryComponent = ( moduleFactory.moduleType as any ).entry;
      const compFactory = moduleRef.componentFactoryResolver.resolveComponentFactory(
          entryComponent
      );
      this.vcRef.createComponent( compFactory );
    } );
  }

  private processPlanningData(data:any):void{
    this.appModel.planningData = PlanningUtils.processPlanningPhase(data);
  }
}

