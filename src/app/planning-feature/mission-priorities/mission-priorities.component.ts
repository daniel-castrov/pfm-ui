import { Component, OnInit, ViewChild } from '@angular/core';
import { PlanningService } from '../services/planning-service';
import { ListItem } from '../models/ListItem';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { MissionPriority } from '../models/MissionPriority';
import { ActionCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { AttachmentCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/attachment-cell-renderer/attachment-cell-renderer.component';
import { DataGridMessage } from '../../pfm-coreui/models/DataGridMessage';
import { TextCellEditorComponent } from '../../pfm-coreui/datagrid/renderers/text-cell-editor/text-cell-editor.component';
import { TextCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/text-cell-renderer/text-cell-renderer.component';
import { MissionAction } from '../models/MissionAction';
import { MissionAttachment } from '../models/MissionAttachment';
import { GridApi, ColumnApi } from '@ag-grid-community/all-modules';
import { DatagridComponent } from '../../pfm-coreui/datagrid/datagrid.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pfm-planning',
  templateUrl: './mission-priorities.component.html',
  styleUrls: ['./mission-priorities.component.scss']
})
export class MissionPrioritiesComponent implements OnInit {

  @ViewChild(DropdownComponent, {static: false}) yearDropDown: DropdownComponent;

  gridApi:GridApi;
  columnApi:ColumnApi;
  id:string = 'mission-priorities-component';
  busy:boolean;
  actionInProgress:boolean = false;
  availableYears: ListItem[];
  selectedYear:string;
  missionData:MissionPriority[];

  columns:any[];

  constructor(private planningService:PlanningService, private dialogService:DialogService, private route:ActivatedRoute) {
    if (this.route.snapshot.params.name){
      let year:any = this.route.snapshot.params.name;
      console.log(this.route.snapshot.params.name);
      this.selectedYear = year;
      this.yearSelected({"name": year});
    }
    this.columns = [
      {
        headerName: 'Priority',
        field: 'priority',
        //type: 'numericColumn',
        maxWidth: 75,
        minWidth: 75,
        rowDrag: true,
        rowDragManaged: true,
        valueGetter: function(params) {return params.node.rowIndex + 1;}
      },
      {
        headerName: 'Mission Title',
        field: 'title',
        editable:true,
        maxWidth: 400,
        minWidth: 400,
        cellRendererFramework: TextCellRendererComponent,
        cellEditorFramework: TextCellEditorComponent,
        cellRendererParams: {'maxSize': 50},
        cellEditorParams: {'maxSize': 50}
      },
      {
        headerName: 'Mission Description',
        field: 'description',
        editable: true,
        cellRendererFramework: TextCellRendererComponent,
        cellEditorFramework: TextCellEditorComponent,
        cellRendererParams: {'maxSize': 200},
        cellEditorParams: {'maxSize': 200}
      },
      {
        headerName: 'Attachments',
        field: 'attachments',
        maxWidth: 225,
        minWidth: 225,
        cellRendererFramework: AttachmentCellRendererComponent
      },
      {
        headerName: 'Actions',
        field: 'actions',
        maxWidth: 175,
        minWidth: 175,
        cellRendererFramework: ActionCellRendererComponent
      }
    ];

  }

  onRowDragEnd(event:any):void{
    let newIndex:number = event.overIndex;
    let oldIndex:number = event.node.data.priority - 1;

    let temp:any[] = this.missionData.slice();

    temp.splice(newIndex,0,temp.splice(oldIndex,1)[0]);
    for(let i=0; i<temp.length; i++){
      temp[i].priority = i + 1;
    }
    this.missionData = temp;
    console.info(event);
  }

  onGridIsReady(gridApi:GridApi):void{
    this.gridApi = gridApi;
  }

  onColumnIsReady(columnApi:ColumnApi):void{
    this.columnApi = columnApi;
  }

  handleCellAction(cellAction:DataGridMessage):void{
    //this.dialogService.displayDebug(cellAction);
    switch(cellAction.message){
      case "save": {
        this.saveRow(cellAction.rowIndex);
        break;
      }
      case "edit": {
        this.editRow(cellAction.rowIndex)
        break;
      }
      case "upload": {
        // stub
        break;
      }
      case "delete-row": {
        this.deleteRow(cellAction.rowIndex, cellAction.rowData);
        break;
      }
      case "delete-attatchments": {
        // stub
        break;
      }
    }
  }

  onAddNewRow(event:any):void{
    if(event.action === "add-single-row"){
      let mp:MissionPriority = new MissionPriority();
      if (this.missionData.length === 0) {
        mp.priority = 1;
      }
      else {
        mp.priority = this.missionData[this.missionData.length - 1].priority + 1;
      }
      mp.title = "";
      mp.description = "";
      mp.attachments = [];
      mp.actions = new MissionAction();
      mp.actions.canEdit = false;
      mp.actions.canSave = true;
      mp.actions.canDelete = true;
      mp.actions.canUpload = true;
      this.gridApi.updateRowData({add: [mp]});
      this.missionData.push(mp);
      this.editRow(mp.priority - 1);
    }
    else if(event.action === "add-rows-from-year"){
      // get rows
      // push onto mission data
      // update grid
    }
  }


  yearSelected(item:any):void{
    this.selectedYear = item ? item.name : undefined;
    if(this.selectedYear){
      this.busy = true;
      this.planningService.getMissionPriorities(this.selectedYear).subscribe(
        resp => {
          this.busy = false;
          this.missionData = (resp as any);

        },
        error =>{
          this.busy = false;
          this.dialogService.displayDebug(error);
        });
    }
  }

  onOpenPlanningPhase():void{
    if(this.yearDropDown.isValid()){
      this.dialogService.displayError("not implemented");
    }
  }

  ngOnInit() {
    this.busy = true;
    this.planningService.getMissionPrioritiesYears().subscribe(
      resp => {
        this.busy = false;
        let years:string[] = resp as any;
        this.availableYears = this.toListItem(years);
      },
      error =>{
        this.busy = false;
        this.dialogService.displayDebug(error);
      });
  }

  private toListItem(years:string[]):ListItem[]{
    let items:ListItem[] = [];
    for(let year of years){
      let item:ListItem = new ListItem();
      item.id = year;
      item.name = year;
      item.value = year;
      items.push(item);
    }
    return items;
  }

  private editMode(rowId:number){
    // toggle actions
    this.missionData[rowId].actions.canUpload = true;
    this.missionData[rowId].actions.canSave = true;
    this.missionData[rowId].actions.canEdit = false;
    // disable attatchments dropdown
  }

  private viewMode(rowId:number){
    //toggle actions
    this.gridApi.stopEditing();
    this.missionData[rowId].actions.canUpload = false;
    this.missionData[rowId].actions.canSave = false;
    this.missionData[rowId].actions.canEdit = true;
  }

  private saveRow(rowId:number){

    //check columns Title max 45 chars, description max 200 chars
    let row:MissionPriority = this.missionData[rowId];
    let error:string = "";
    let isError:boolean = false;
    if(row.title.length <= 45 && row.title.length > 0 && row.description.length <= 200 && row.description.length > 0){
      this.missionData[rowId] = row;
      //return to view mode
      this.viewMode(rowId);
      //update view
      this.gridApi.setRowData(this.missionData);
    }
    else{
      if (row.title.length === 0){
        error = error + 'The Title is empty. ';
        isError = true;
      }
      if (row.description.length === 0){
        error = error + 'The Description is empty. ';
        isError = true;
      }
      if (row.title.length > 45){
        error = error + 'The Title is longer than the max of 45 characters. ';
        isError = true;
      }
      if (row.description.length > 200){
        error = error + 'The Description is longer than the max of 200 characters';
        isError = true;
      }
      if (isError){
        this.dialogService.displayError(error);
      }
    }
  }

  private editRow(rowId:number){
    //edit mode
    this.editMode(rowId);

    //edit the title and description
    this.gridApi.setFocusedCell(rowId, "title");
    this.gridApi.startEditingCell({
      rowIndex: rowId,
      colKey: "title"
    });
  }

  deleteRow(rowId:number, data:any){
    //confirmation message
    this.dialogService.displayConfirmation("Are you sure you want to delete this row?", "Delete Confirmation",
    ()=>{
      //delete row
      console.log(this.missionData.splice(rowId, 1));

      //update priority
      for (let i = rowId; i < this.missionData.length; i++){
        this.missionData[i].priority= this.missionData[i].priority + 1;
      }

      //update view
      this.gridApi.setRowData(this.missionData);
    },
    ()=>{
      console.log("Cancel Worked!");
    });
  }

  private deleteAttatchment(rowId:number, attatchmentIds:[], event:any){
    //confirmation/selection message

    //delete attatchment(s)
    //this.missionData[rowId].attachments.slice(attatchmentId, 1);

    //update row
  }

}
