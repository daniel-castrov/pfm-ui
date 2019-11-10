import { Component, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PluginLoaderService } from '../services/plugin-loader/plugin-loader.service';

@Component({
  selector: 'app-planning-feature',
  templateUrl: './planning-feature.component.html',
  styleUrls: ['./planning-feature.component.css']
})
export class PlanningFeatureComponent implements OnInit {

  @ViewChild('targetRef', { read: ViewContainerRef, static: true }) vcRef: ViewContainerRef;

  constructor(private injector: Injector, private pluginLoader: PluginLoaderService) { }

  ngOnInit() {
    this.loadPlugin("planning");
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

