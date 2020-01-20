import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataGridMessage } from '../models/DataGridMessage';
import { ColumnApi, GridApi } from '@ag-grid-community/all-modules';
import { FundingData } from '../../programming-feature/models/FundingData';
import { group } from '@angular/animations';

@Component({
  selector: 'pfm-tree-datagrid',
  templateUrl: './tree-datagrid.component.html',
  styleUrls: ['./tree-datagrid.component.scss']
})
export class TreeDatagridComponent implements OnInit {

  //@Input() columns:any;
  @Input() fieldsToGroup:any[];
  @Input() fieldsToSum:any[];
  @Input() fieldsToAverage:any[];//just to illistrate extending sum/average/max ect...

  @Input() rows:any[];
  @Input() showAddRow:boolean = false;
  @Input() tabToNextCell;
  @Output() onCellAction:EventEmitter<DataGridMessage> = new EventEmitter<DataGridMessage>();
  @Output() onAddNewRowEvent:EventEmitter<any> = new EventEmitter<any>();
  @Output() onGridIsReady:EventEmitter<GridApi> = new EventEmitter<GridApi>();
  @Output() onRowDragEndEvent:EventEmitter<any> = new EventEmitter<any>();
  @Output() onColumnIsReady:EventEmitter<ColumnApi> = new EventEmitter<ColumnApi>();


  gridApi:GridApi;
  columnsForGrid:any[];
  rowsForGrid:any;

  constructor() { }

  handleGridIsReady(gridApi:any):void{
    this.gridApi = gridApi;
    this.onGridIsReady.emit(gridApi);
  }

  handleCellAction(cellAction:DataGridMessage):void{
    switch(cellAction.message){
      case "tree-row-expand":{
        if(cellAction.rowData.selected){
          cellAction.rowData.selected = false;
          this.handleTreeCollapse(cellAction);
        }
        else{
          cellAction.rowData.selected = true;
          this.handelTreeExpand(cellAction);
        }
        console.info(cellAction.rowData.selected);
      }
    }
    this.onCellAction.emit(cellAction);
  }

  ngOnInit() {
    console.info('hit tree-datagrid init');
    //the grid should display all of the columns - so include the groupby and sumby columns
    this.columnsForGrid = [];
    for(let c of this.fieldsToGroup){
      this.columnsForGrid.push(c);
    }
    for(let c of this.fieldsToSum){
      this.columnsForGrid.push(c);
    }

    //get a list of columns names to group up the rows by
    let nodes:string[] = [];
    for(let f of this.fieldsToGroup){
      nodes.push(f.field);
    }

    for(let fs of this.fieldsToSum){
      console.info(fs);
    }
    //process the flat data into a tree
    let children:any[] = this.doWhile(0, nodes, this.rows);

    //push the top-level (grouped) children rows into the grid
    this.rowsForGrid = [];
    for(let c of children){
      this.rowsForGrid.push(c);
    }
  }

  //recursive - group up the rows by the list of columns
  private doWhile(index:number, columns:string[], rows:any[]):any[]{
    if(index < columns.length){
      let d = "(" + index + " - " + columns[index] + ")";
      let children:any[] = this.convertToTreeGrid(index, columns[index], rows);

      if(children && children.length > 0){
        for(let c of children){
          c.children = this.doWhile(index + 1, columns, c.children);
        }
      }
      return children
    }
  }

  //group up rows by the give columnId, and sum the fields - place children under the tree-node
  private convertToTreeGrid(depth:number, columnId:string, rows:any[]):any[]{

    let summaryRows:any[] = [];
    let count:number = 0;
    let dict:any = {};
    for(let rowx of rows){
      let row = JSON.parse(JSON.stringify(rowx));
      let key = row[columnId];

      if(!dict[key]){

        let node = JSON.parse(JSON.stringify(rowx));
        node.id = "node_" + columnId + "_" + count++;

        //blank out groups that are not part of the summary - columnId - so need the list of columns to group in here
        //hard-code for now
        node.depth = depth;

        for(let f of this.fieldsToGroup){
          if(f.field !== columnId){
            node[f.field] = "";
          }
        }
        node.children = [JSON.parse(JSON.stringify(rowx))];
        summaryRows.push(node);
        dict[key] = node;
      }
      else{//sum the values for now
        dict[key].children.push(row);
        for(let fs of this.fieldsToSum){
            dict[key][fs.field] += row[fs.field];
          }
        }
      }
    return summaryRows;
  }

  //process tree expand - all direct children to the grid
  private handelTreeExpand(cellAction:DataGridMessage):void{
    console.info('expand');
    let index:number = this.rowsForGrid.indexOf(cellAction.rowData);
    for(let item of cellAction.rowData.children){
      this.rowsForGrid.splice(index+1, 0, item);
    }
    this.gridApi.setRowData(this.rowsForGrid);
  }

  //process tree collapse clicked - remove all descendents from the grid
  private handleTreeCollapse(cellAction:DataGridMessage):void{
    console.info('colapse');
    this.removeFromGrid(cellAction.rowData.children);
    this.gridApi.setRowData(this.rowsForGrid);
  }

  //recursion - remove all children + grand... from the flat grid
  private removeFromGrid(items:any[]):void{

    for(let item of items){
      item.selected = false;
      let index:number = this.rowsForGrid.indexOf(item);

      if(index > -1){
        this.rowsForGrid.splice(index, 1);

        if(item.children && item.children.length > 0){
          this.removeFromGrid(item.children);
        }
      }
    }
  }

}
