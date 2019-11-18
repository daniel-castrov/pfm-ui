import { Component, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PluginLoaderService } from '../../services/plugin-loader/plugin-loader.service';

@Component({
  selector: 'pfm-planning',
  templateUrl: './lock-planning.component.html',
  styleUrls: ['./lock-planning.component.scss']
})
export class LockPlanningComponent implements OnInit {

  @ViewChild('targetRef', { read: ViewContainerRef, static: true }) vcRef: ViewContainerRef;

  constructor(private injector: Injector, private pluginLoader: PluginLoaderService) { }

  ngOnInit() {
    this.loadPlugin("planning-lock");
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
