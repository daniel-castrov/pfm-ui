import { Component } from '@angular/core';
import { AgRendererComponent, ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-simple-link-cell-renderer',
  templateUrl: './simple-link-cell-renderer.component.html',
  styleUrls: ['./simple-link-cell-renderer.component.scss'] 
})

export class SimpleLinkCellRendererComponent implements ICellRendererAngularComp {
  private params;

  constructor() {
  }

  agInit(param) {
    this.params = param;
  }

  link(): string {
    return this.params.value.link; 
  }

  linktext(): string {
    return this.params.value.linktext;
  }

  refresh(): boolean {
    return true;
  }
}

export class SimpleLink {
  link: string;
  linktext: string;

  constructor( lnk:string, lnktext ) {
    this.link = lnk;
    this.linktext = lnktext;
  }
}
