import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tree-cell-renderer',
  templateUrl: './tree-cell-renderer.component.html',
  styleUrls: ['./tree-cell-renderer.component.scss']
})
export class TreeCellRendererComponent implements OnInit {

  constructor() { }

  public params: any;
  public value: string;
  public id:string;

  agInit(params: any): void {
    this.params = params;
    this.value = this.params.value;
    this.id = "TextCellRendererComponent" + this.params.rowIndex;
  }

  ngOnInit() {
  }

}
