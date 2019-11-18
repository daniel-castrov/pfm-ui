import { Component, Input, OnInit } from '@angular/core';
import {AllCommunityModules} from '@ag-grid-community/all-modules';

@Component({
  selector: 'pfm-datagrid',
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.scss']
})
export class DatagridComponent implements OnInit {

  @Input() columns:any;
  @Input() rows:any;

  constructor() { }



  modules = AllCommunityModules;

  ngOnInit() {
  }

}
