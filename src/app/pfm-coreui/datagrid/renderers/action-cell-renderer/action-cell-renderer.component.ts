import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pfm-action-cell-renderer',
  templateUrl: './action-cell-renderer.component.html',
  styleUrls: ['./action-cell-renderer.component.scss']
})
export class ActionCellRendererComponent implements OnInit {

  data: any;
  params: any;

  constructor(){}

  agInit(params) {
    this.params = params;
    this.data =  params.value;
  }

  ngOnInit() {}


  editRow() {
    let rowData = this.params;
    let i = rowData.rowIndex;
    console.log(rowData);

  }

  viewRow() {
    let rowData = this.params;
    console.log(rowData);
  }

}
