import { Component, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogService } from '../pfm-coreui/services/dialog.service';
import { PlanningService } from './services/planning-service';
import { AppModel } from '../pfm-common-models/AppModel';
import { PlanningUtils } from './utils/planning-utils';

@Component({
  selector: 'app-planning-feature',
  templateUrl: './planning-feature.component.html',
  styleUrls: ['./planning-feature.component.css']
})
export class PlanningFeatureComponent implements OnInit {

  @ViewChild('targetRef', { read: ViewContainerRef, static: true })
  vcRef: ViewContainerRef;

  busy: boolean;
  ready: boolean;
  displayOverrideFlag: boolean;

  constructor(
    private appModel: AppModel,
    private planningService: PlanningService,
    private dialogService: DialogService
  ) {
  }

  ngOnInit() {
    // TODO - Notes for dynamic loading libs
    // the appModel should contain an information that can override the default view
    /*
        use the router:Route from angular to find the current page being loaded
        if the page being loaded "planning/create" has an override,
          this.loadPlugin("planning-create");
          displayOverrideFlag = true
        else
           displayOverrideFlag = false
    */
    this.planningService.getAllPlanning().subscribe(
      resp => {
        this.busy = false;
        this.processPlanningData((resp as any).result);
        this.ready = true;
      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      });
  }

  private processPlanningData(data: any): void {
    this.appModel.planningData = PlanningUtils.processPlanningPhase(data);
  }
}

