import { Component, OnInit } from '@angular/core';
import { AgRendererComponent, ICellRendererAngularComp } from 'ag-grid-angular';
import { ProgramsService } from '../../../generated';

@Component({
  selector: 'app-program-cell-renderer',
  templateUrl: './program-cell-renderer.component.html',
  styleUrls: ['./program-cell-renderer.component.scss']
})
export class ProgramCellRendererComponent implements ICellRendererAngularComp, OnInit {
  private params;
  private progname;
  private _id;
  public programlkp: Map<string, string> = new Map<string, string>();

  constructor(private progsvc: ProgramsService) { 
  }

  ngOnInit() {
    this.progsvc.getIdNameMap().subscribe(data => { 
      Object.getOwnPropertyNames(data.result).forEach(mrid => { 
        this.programlkp.set(mrid, data.result[mrid]);
      });
    });
  }

  agInit(param) {
    this.params = param;
  }

  fullname(): string {
    return (this.programlkp.has(this.params.data.mrId)
      ? this.programlkp.get(this.params.data.mrId)
      : this.params.data.mrId);

  }

  id(): string{
    return this.params.data.id;
  }

  refresh(): boolean { 
    return true;
  }
}
