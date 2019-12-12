import { Component, OnInit, ViewChild, ComponentFactoryResolver } from '@angular/core';
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
import { GridApi, ColumnApi, RowNode, Column, CellPosition } from '@ag-grid-community/all-modules';
import { DatagridComponent } from '../../pfm-coreui/datagrid/datagrid.component';
import { ActivatedRoute } from '@angular/router';
import { DisabledActionCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/disabled-action-cell-renderer/disabled-action-cell-renderer.component';
import { SigninService } from '../../pfm-auth-module/services/signin.service';

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
  validInput:boolean = false;
  POMLocked:boolean = false;
  POMClosed:boolean = false;
  POMManager:boolean = false;

  columns:any[];

  constructor(private planningService:PlanningService, private dialogService:DialogService, private route:ActivatedRoute,
    private signInService:SigninService) {
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
        onCellValueChanged: params => this.onValueChanged(params)
        // cellRendererFramework: TextCellRendererComponent,
        // cellEditorFramework: TextCellEditorComponent,
        // cellRendererParams: {'maxSize': 50},
        // cellEditorParams: {'maxSize': 50, 'focusOnEditMode': true}
      },
      {
        headerName: 'Mission Description',
        field: 'description',
        editable: true,
        // cellRendererFramework: TextCellRendererComponent,
        // cellEditorFramework: TextCellEditorComponent,
        // cellRendererParams: {'maxSize': 200},
        // cellEditorParams: {'maxSize': 200}
        onCellValueChanged: params => this.onValueChanged(params)
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
    this.tabToNextCell = this.tabToNextCell.bind(this);
  }

  onRowDragEnd(event:any):void{
    let newIndex:number = event.overIndex;
    let oldIndex:number = event.node.data.order - 1;

    let temp:any[] = this.missionData.slice();

    temp.splice(newIndex,0,temp.splice(oldIndex,1)[0]);
    for(let i=0; i<temp.length; i++){
      temp[i].order = i + 1;
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
        this.updateDocuments(cellAction.rowIndex);
        break;
      }
      case "delete-row": {
        this.deleteRow(cellAction.rowIndex);
        break;
      }
      case "delete-attachments": {
        this.deleteAttachments(cellAction.rowIndex);
        break;
      }
    }
  }

  onAddNewRow(event:any):void{
    if(event.action === "add-single-row"){
      let mp:MissionPriority = new MissionPriority();
      if (this.missionData.length === 0) {
        mp.order = 1;
      }
      else {
        mp.order = this.missionData[this.missionData.length - 1].order + 1;
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
      this.editRow(mp.order - 1);
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
    this.isPOMManager();
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
    // enable attatchments dropdown

  }

  private saveRow(rowId:number){
    let error:string = "";
    let isError:boolean = false;

    //copy data
    let row:MissionPriority = this.gridApi.getDisplayedRowAtIndex(rowId).data;
    let copy = JSON.stringify(this.missionData[rowId]);
    this.gridApi.stopEditing();
    console.log(this.missionData[rowId]);
    let test:MissionPriority = JSON.parse(copy);

    //check columns Title max 45 chars, description max 200 chars
    if(row.title.length <= 45 && row.title.length > 0 && row.description.length <= 200 && row.description.length > 0){
      //return to view mode
      this.viewMode(rowId);
      this.gridApi.setRowData(this.missionData);

      // if(!this.missionData[rowId].id){
      //   this.busy = true;
      //   this.planningService.createMissionPriority(this.missionData[rowId]).subscribe(
      //     resp => {
      //       this.busy = false;
      //       this.missionData = resp as any;
      //
      //       //update view
      //       this.gridApi.setRowData(this.missionData);
      //
      //     },
      //     error =>{
      //       this.busy = false;
      //       this.dialogService.displayDebug(error);
      //     });
      // }
      // this.busy = false;
      // this.dialogService.displayToastError("Not Implemented");

    }
    else{
      if (row.title.length === 0){
        error = 'The Title is empty.                                           ';
        isError = true;
      }
      if (row.description.length === 0){
        error = error + 'The Description is empty.                             ';
        isError = true;
      }
      if (row.title.length > 45){
        error = error + 'The Title is longer than the max of 45 characters.    ';
        isError = true;
      }
      if (row.description.length > 200){
        error = error + 'The Description is longer than the max of 200 characters';
        isError = true;
      }
      if (isError){
        this.dialogService.displayError(error);
      }
      // deserialize save
      row.title = test.title;
      row.attachments = test.attachments;
      row.description = test.description;
      row.actions = test.actions;
      row.order = test.order;
      this.editRow(rowId);
    }
  }

  private editRow(rowId:number){
    //edit mode
    this.editMode(rowId);

    //edit the title and description
    this.gridApi.startEditingCell({
      rowIndex: rowId,
      colKey: "title"
    });
  }

  private deleteRow(rowId:number){
    //confirmation message
      //delete row
      console.log(this.missionData.splice(rowId, 1));

      //update order
      for (let i = rowId; i < this.missionData.length; i++){
        this.missionData[i].order= this.missionData[i].order + 1;
      }

      //update view
      this.gridApi.setRowData(this.missionData);
  }

  private updateDocuments(rowId:number):void{

  }

  private deleteAttachments(rowId:number){
    // confirmation/selection message
    this.dialogService.displayCheckBoxSelection("test", "Select Attachments to Delete", this.missionData[rowId].attachments,
      () => {
      // delete attatchment(s)
      for (let attachment of this.missionData[rowId].attachments){
        if (attachment.selectedForDelete){
          let index = this.missionData[rowId].attachments.indexOf(attachment);
          this.missionData[rowId].attachments.splice(index, 1);
          //refresh this row in grid
        }
      }
      console.log("Ok worked");
      //update row
    },
      () => {
      // reset data JSON Serialize and Deserialize

      console.log("Cancel Worked!");
    });
  }

  // Overwrite tab functionality to tab back and forth from title and description
  private tabToNextCell (params) {
    let rowIndex = params.previousCellPosition.rowIndex;
    let nextColumn:Column;
    let nextCell:CellPosition = params.nextCellPosition;
    console.log("init");
    console.log(params);
    // if the column is title
    if (params.previousCellPosition.column.colId === "title" && params.backwards === true){
      console.log("isTitle");
      nextColumn = this.columnApi.getColumn("description");
      nextCell = {
        rowIndex: rowIndex,
        column: nextColumn,
        rowPinned: undefined
      }
      console.log(nextColumn);
    }
    else if (params.previousCellPosition.column.colId === "description" && params.backwards === false) {
      console.log("isDescription");
      nextColumn = this.columnApi.getColumn("title");
      nextCell = {
        rowIndex: rowIndex,
        column: nextColumn,
        rowPinned: undefined
      }
      console.log(nextColumn);
    }
    return nextCell;
  }

  // Watches when values change
  private onValueChanged(params) {
    console.log(params);

    // check title

    // check description

    // generate error


  }

  //check if current user has POM Manager role
  isPOMManager(){
    this.signInService.getUserRoles().subscribe(
      resp  => {
        let result: any = resp;
        if(result.result.includes("POM_Manager")){
          this.POMManager = true;
        }        
      },
      error =>{
        this.busy = false;
        this.dialogService.displayDebug(error);
      });
    this.POMManager = false;
  }

  lockPlanningPhase(){
    this.POMLocked = true;
    //run service method to perform back-end locking of planning phase
    this.dialogService.displayToastInfo(`Planning Phase for ${ this.selectedYear } successfully locked`);    
    this.columns[4] = {
      headerName: 'Actions',
      field: 'actions',
      cellRendererFramework: DisabledActionCellRendererComponent
    };
    this.gridApi.setColumnDefs(this.columns);
  }

  closePlanningPhase(){
    this.POMClosed = true;
    //run service method to perform back-end locking of planning phase
    this.dialogService.displayToastInfo(`Planning Phase for ${ this.selectedYear } successfully closed`);
  }
}
