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
  availableYears: ListItem[];
  selectedYear:string;
  missionData:MissionPriority[];

  columns:any[];

  constructor(private planningService:PlanningService, private dialogService:DialogService) {
    this.columns = [
      {
        headerName: 'Priority',
        field: 'priority',
        width: 100,
        resizable: true,
        rowDrag: true,
        rowDragManaged: true,
        valueGetter: function(params) {return params.node.rowIndex + 1;}
      },
      {
        headerName: 'Mission Title',
        field: 'title',
        editable:true,
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
        cellRendererParams: {'maxSize': 150},
        cellEditorParams: {'maxSize': 150}
      },
      {
        headerName: 'Attachments',
        field: 'attachments',
        cellRendererFramework: AttachmentCellRendererComponent
      },
      {
        headerName: 'Actions',
        field: 'actions',
        cellRendererFramework: ActionCellRendererComponent
      }
    ];

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
        console.log("save");
        this.saveRow(cellAction.rowIndex);
        break;
      }
      case "edit": {
        console.log("edit");
        this.editRow(cellAction.rowIndex)
        break;
      }
      case "upload": {
        console.log("upload");
        break;
      }
      case "delete-row": {
        this.deleteRow(cellAction.rowIndex, cellAction.rowData);
        break;
      }
      case "delete-attatchments": {
        console.log("delete-attatchments");
        console.log(cellAction.rowIndex);
        break;
      }
    }
  }

  onAddNewRow(event:any):void{
    if(event.action === "add-single-row"){
      let mp:MissionPriority = new MissionPriority();
      mp.attachments = [];
      mp.actions = new MissionAction();
      mp.actions.canEdit = true;
      mp.actions.canSave = true;
      mp.actions.canDelete = true;
      mp.actions.canUpload = true;
      mp.priority = this.missionData[this.missionData.length - 1].priority + 1;
      event.gridApi.updateRowData({add: [mp]});
    }
    if(event.action === "add-rows-from-year"){
      //get rows
      //push onto mission data
      //update grid
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
    //toggle actions
    this.missionData[rowId].actions.canUpload = true;
    this.missionData[rowId].actions.canSave = true;
    this.missionData[rowId].actions.canEdit = false;
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
    if(row.title.length <= 45 && row.title.length > 0 && row.description.length <= 200 && row.description.length > 0){
      this.missionData[rowId] = row;
      //return to view mode
      this.viewMode(rowId);
      //update view
      this.gridApi.setRowData(this.missionData);
    }
    else if (row.title.length === 0){
      //error message
      this.dialogService.displayError('The Title is empty');
    }
    else if (row.description.length === 0){
      this.dialogService.displayError('The Description is empty');
    }
    else if (row.title.length >= 45){
      this.dialogService.displayError('The Title is longer than the max of 45 characters');
    }
    else if (row.description.length >= 200){
      this.dialogService.displayError('The Description is longer than the max of 200 characters');
    }

  }

  private editRow(rowId:number){
    //edit mode
    this.editMode(rowId);

    //edit the title and description
    this.gridApi.startEditingCell({
      rowIndex: rowId,
      colKey: 'title'
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

  private deleteAttatchment(rowId:number, attatchmentsId:any, event:any){
    //confirmation/selection message

    //delete attatchment(s)
    //this.missionData[rowId].attachments.slice(attatchmentId, 1);

    //update row
  }

}
