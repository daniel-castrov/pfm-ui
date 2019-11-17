import { Component, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PluginLoaderService } from '../services/plugin-loader/plugin-loader.service';
import { AppModel } from '../pfm-common-models/AppModel';

@Component({
  selector: 'app-budget-feature',
  templateUrl: './budget-feature.component.html',
  styleUrls: ['./budget-feature.component.css']
})
export class BudgetFeatureComponent implements OnInit {

  @ViewChild('targetRef', { read: ViewContainerRef, static: true }) vcRef: ViewContainerRef;

  constructor(private injector: Injector, private pluginLoader: PluginLoaderService, private appModel:AppModel) { }

  ngOnInit() {

    if(this.appModel.userDetails.firstName === 'Bill'){
      this.loadPlugin("budget-demo");
    }
    else{
      this.loadPlugin("budget");//default
    }
  }

  loadPlugin(pluginName: string) {
    this.pluginLoader.load(pluginName).then(moduleFactory => {
      const moduleRef = moduleFactory.create(this.injector);
      const entryComponent = (moduleFactory.moduleType as any).entry;
      const compFactory = moduleRef.componentFactoryResolver.resolveComponentFactory(
        entryComponent
      );
      this.vcRef.createComponent(compFactory);
    });
  }
}
