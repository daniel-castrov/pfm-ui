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
  @Input() fieldsToAverage:any[];//just to illistrate extending

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
      case "cellClicked":{
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
    //this part won't change much - yet, maybe with the total/root node
    this.columnsForGrid = [];
    for(let c of this.fieldsToGroup){
      this.columnsForGrid.push(c);
    }
    for(let c of this.fieldsToSum){
      this.columnsForGrid.push(c);
    }

    //we will need a node for each of these, and they should have there children grouped under them
    let nodes:string[] = ["alc", "majcom", "mbase", "nsn"];
    let children:any[] = this.doWhile(0, nodes, this.rows);


    //convert to flat grid - like expand all
    this.rowsForGrid = [];
    for(let c of children){
      //this.addToFlatGrid(c, this.rowsForGrid);
      this.rowsForGrid.push(c);
    }

  }

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
        dict[key].fy1 += row.fy1;
        dict[key].fy2 += row.fy2;
        dict[key].fy3 += row.fy3;
        dict[key].fy4 += row.fy4;
      }
    }

    return summaryRows;
  }

  private addToFlatGrid(item, rows:any[]):void{
    rows.push(item);
    if(item.children && item.children.length > 0){
      for(let c of item.children){
        this.addToFlatGrid(c, rows);
      }
    }
  }

  private handelTreeExpand(cellAction:DataGridMessage):void{
    console.info('expand');

    let index:number = this.rowsForGrid.indexOf(cellAction.rowData);
    for(let item of cellAction.rowData.children){

      //blank out groups that are not part of the summary - columnId - so need the list of columns to group in here
      //item.alc = "";
      //item.majcom="";//to do, need to know which column
      //item.mbase=""
      //item.nsn = "";
      this.rowsForGrid.splice(index+1, 0, item);
    }

    this.gridApi.setRowData(this.rowsForGrid);
  }

  private handleTreeCollapse(cellAction:DataGridMessage):void{
    console.info('colapse');
    this.removeFromGrid(cellAction.rowData.children);
    this.gridApi.setRowData(this.rowsForGrid);
  }

  private removeFromGrid(items:any[]):void{

    for(let item of items){
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
