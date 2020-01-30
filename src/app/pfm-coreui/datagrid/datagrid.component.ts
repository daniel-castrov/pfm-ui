import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {AllCommunityModules, ColumnApi, GridApi, Module} from '@ag-grid-community/all-modules';

import { DatagridMbService } from '../services/datagrid-mb.service';
import { DataGridMessage } from '../models/DataGridMessage';
import { ListItem } from '../../pfm-common-models/ListItem';

@Component({
  selector: 'pfm-datagrid',
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.scss']
})
export class DatagridComponent implements OnInit {

  @Input() columns:any; // Data grid columns
  @Input() rows:any; // Data grid rows
  @Input() showAddDropdownCta:boolean = false; // Controls visibility of add dropdown CTA
  @Input() showPagination:boolean = true; // Controls visibility and activation of pagination
  @Input() addDropdownCtaTooltip:string = 'Add';  // Add dropdown CTA tooltip
  @Input() addDropdownCtaOptions:ListItem[];
  @Input() tabToNextCell;

  @Output() onCellAction:EventEmitter<DataGridMessage> = new EventEmitter<DataGridMessage>();
  @Output() onAddCtaEvent:EventEmitter<any> = new EventEmitter<any>();
  @Output() onGridIsReady:EventEmitter<GridApi> = new EventEmitter<GridApi>();
  @Output() onRowDragEndEvent:EventEmitter<any> = new EventEmitter<any>();
  @Output() onColumnIsReady:EventEmitter<ColumnApi> = new EventEmitter<ColumnApi>();

  public defaultColDef: any;
  public modules: Module[] = AllCommunityModules;
  public api: GridApi;
  public columnApi: ColumnApi;
  public options:ListItem[];
  public pageSize:number = 20;
  private paginationNumberFormatter: any;

  constructor(private datagridMBService:DatagridMbService) {
    datagridMBService.messageBus$.subscribe(message => {
      this.onCellAction.emit(message);
    });

    this.defaultColDef = {
      resizable: true,
      sortable: true,
      filter: true,
    };
  }

  public handleAddCta():void{
    // used for non dropdown add CTA
  }

  public handleAddDropdownCta( item:ListItem):void{
    if(item){
      if(item.id === "add-row"){
        this.onAddCtaEvent.emit({gridApi: this.api, action: 'add-single-row'});
      }
      else if (item.id === "add-year"){
        this.onAddCtaEvent.emit({gridApi: this.api, action: 'add-rows-from-year'});
      }
    }
  }

  public onModelUpdated() {
  }

  onRowDragEnd(event:any):void{
    this.onRowDragEndEvent.emit(event);
  }

  onCellClicked(event:any):void{
    let message:DataGridMessage = new DataGridMessage();

    message.rowIndex = event.rowIndex;
    message.columnId = event.column.colId;
    message.message = "cellClicked";
    message.rowData = event.data;
    message.messageType = "grid-cell";

    this.onCellAction.emit(message);
  }

  public onGridReady(params) {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
    this.onGridIsReady.emit(this.api);
    this.onColumnIsReady.emit(this.columnApi);
    this.api.paginationSetPageSize(this.pageSize);
    this.paginationNumberFormatter = function(params) {
      return "[" + params.value.toLocaleString() + "]";
    };
  }

  onGridSizeChanged(){
    this.api.sizeColumnsToFit();
  }

  ngOnInit() {
    if (this.addDropdownCtaOptions) {
      this.options = this.addDropdownCtaOptions;
    }
    else {
      // Populate dropdown options with default
      let item:ListItem = new ListItem();
      item.name = "Add a new row";
      item.value = "add-row";
      item.id = "add-row";
      let item2:ListItem = new ListItem();
      item2.name = "Add all rows from another year";
      item2.value = "add-year";
      item2.id = "add-year";
      this.options = [item, item2];
    }
  }

  handlePageSizeChanged( pageSize: any ) {
    this.api.paginationSetPageSize(this.pageSize);
  }
}
