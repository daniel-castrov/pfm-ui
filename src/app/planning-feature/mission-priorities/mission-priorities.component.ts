import { Component, OnInit, ViewChild} from '@angular/core';
import { PlanningService } from '../services/planning-service';
import { ListItem } from '../../pfm-common-models/ListItem';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { MissionPriority } from '../models/MissionPriority';
import { ActionCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { AttachmentCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/attachment-cell-renderer/attachment-cell-renderer.component';
import { DataGridMessage } from '../../pfm-coreui/models/DataGridMessage';
import { GridApi, ColumnApi, RowNode, Column, CellPosition } from '@ag-grid-community/all-modules';
import { ActivatedRoute } from '@angular/router';
import { SigninService } from '../../pfm-auth-module/services/signin.service';
import { AppModel } from '../../pfm-common-models/AppModel';
import { FileMetaData } from '../../pfm-common-models/FileMetaData';
import { Attachment } from '../../pfm-common-models/Attachment';
import { SecureDownloadComponent } from '../../pfm-secure-filedownload/secure-download/secure-download.component';
import { Action } from '../../pfm-common-models/Action';
import { PlanningPhase } from '../models/PlanningPhase';

@Component({
  selector: 'pfm-planning',
  templateUrl: './mission-priorities.component.html',
  styleUrls: ['./mission-priorities.component.scss']
})
export class MissionPrioritiesComponent implements OnInit {

  @ViewChild(DropdownComponent, {static: false}) yearDropDown: DropdownComponent;
  @ViewChild(SecureDownloadComponent, {static: false}) secureDownloadComponent: SecureDownloadComponent;

  showDeleteAttachmentDialog:boolean;
  showImportYearDialog:boolean;

  gridApi:GridApi;
  columnApi:ColumnApi;
  id:string = 'mission-priorities-component';
  busy:boolean;
  availableYears: ListItem[];
  selectedYear:string;
  selectedPlanningPhase:PlanningPhase;
  missionData:MissionPriority[];
  POMManager:boolean = false;
  showUploadDialog:boolean;
  selectedRowId:number;
  selectedRow:MissionPriority;
  selectedImportYear:string;
  availableImportYears: ListItem[];

  columns:any[];

  constructor(private appModel:AppModel, private planningService:PlanningService, private dialogService:DialogService, private route:ActivatedRoute, private signInService:SigninService) {

    this.columns = [
      {
        headerName: 'Priority',
        field: 'priority',
        maxWidth: 75,
        minWidth: 75,
        rowDrag: true,
        rowDragManaged: true,
        valueGetter(params) {return params.node.rowIndex + 1;},
        cellClass: "numeric-class",
        cellStyle: { display: 'flex', 'align-items': 'right'}
      },
      {
        headerName: 'Mission Title',
        field: 'title',
        editable:true,
        maxWidth: 400,
        minWidth: 400,
        onCellValueChanged: params => this.onValueChanged(params),
        cellClass: "text-class",
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal'}
      },
      {
        headerName: 'Mission Description',
        field: 'description',
        editable: true,
        onCellValueChanged: params => this.onValueChanged(params),
        cellClass: "text-class",
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal'}
        // cellRendererFramework: TextCellRendererComponent,
        // cellEditorFramework: TextCellEditorComponent,
        // cellRendererParams: {'maxSize': 200},
        // cellEditorParams: {'maxSize': 200}
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

  onRowDragEnd(event: any): void {
    const newIndex: number = event.overIndex;
    const oldIndex: number = event.node.data.order - 1;

    if (newIndex !== oldIndex) {
      // Move mp to new position
      this.missionData.splice(newIndex, 0, this.missionData.splice(oldIndex, 1)[0]);
      // Update order in model and server
      if (newIndex < oldIndex) {
        for (let i = newIndex; i <= oldIndex; i++) {
          this.missionData[i].order = i + 1;
        }
        this.updateRows(newIndex, oldIndex + 1);
      } else {
        for (let i = oldIndex; i <= newIndex; i++) {
          this.missionData[i].order = i + 1;
        }
        this.updateRows(oldIndex, newIndex + 1);
      }
      // Let the grid know about the change
      this.gridApi.setRowData(this.missionData);
    }
  }

  onGridIsReady(gridApi:GridApi):void{
    this.gridApi = gridApi;
  }

  onColumnIsReady(columnApi:ColumnApi):void{
    this.columnApi = columnApi;
  }

  handleCellAction(cellAction:DataGridMessage):void{
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
        this.addAttachment(cellAction.rowIndex);
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
      case "download-attachment":{
        this.downloadAttachment(cellAction);
      }
    }
  }

  private downloadAttachment(cellAction:DataGridMessage):void{
    this.secureDownloadComponent.downloadFile(cellAction.rawData.file);
  }

  onAddNewRow(event:any):void{
    if(event.action === "add-single-row"){
      let mp:MissionPriority = new MissionPriority();
      if (this.missionData.length === 0) {
        mp.order = 1;
      } else {
        mp.order = this.missionData.length + 1;
      }
      mp.title = "";
      mp.description = "";
      mp.attachments = [];
      mp.attachmentsDisabled = true;
      mp.actions = new Action();
      mp.actions.canEdit = false;
      mp.actions.canSave = true;
      mp.actions.canDelete = true;
      mp.actions.canUpload = true;
      this.missionData.push(mp);

      this.gridApi.setRowData(this.missionData);

      this.editRow(this.missionData.length - 1);
    }
    else if(event.action === "add-rows-from-year"){
      this.availableImportYears = [];
      for (let i = 0; i < this.availableYears.length;i++){
        if (this.availableYears[i].name !== this.selectedYear) {
          this.availableImportYears[this.availableImportYears.length] = this.availableYears[i];
        }
      }

      // year selection dialog
      this.showImportYearDialog = true;
    }
  }

  private importYearSelected(year: ListItem){
    //update value
    this.selectedImportYear = year.value;
  }

  private onImportYear(){

    //import rows from selected year.
    if (this.selectedImportYear) {
      this.busy = true;
      const cloneIds: string[] = new Array<string>();
      this.planningService.getMissionPriorities(this.selectedImportYear + '_id').subscribe(
          resp => {
            const result = (resp as any).result;
            if (result  instanceof Array) {
              for (const mp of result as Array<MissionPriority>) {
                  cloneIds.push(mp.id);
              }
            }
            this.planningService.cloneMissionPriorities(this.selectedPlanningPhase.id, cloneIds).subscribe(
                resp => {
                  this.busy = false;
                  const result = (resp as any).result;
                  if (result instanceof Array && result.length !== 0) {
                    let start = 1;
                    if (this.missionData.length !== 0) {
                      start = this.missionData.length;
                    }
                    for (const mp of result as Array<MissionPriority>) {
                      if (!mp.attachments) {
                        mp.attachments = [];
                      }
                      if (!mp.attachmentsDisabled) {
                        mp.attachmentsDisabled = false;
                      }
                      if (!mp.actions) {
                        mp.actions = new Action();
                        mp.actions.canUpload = false;
                        mp.actions.canSave = false;
                        mp.actions.canEdit = true;
                        mp.actions.canDelete = true;
                      }
                      mp.order = mp.order + start;
                      this.missionData[this.missionData.length] = mp;
                    }

                    // Update Grid
                    this.gridApi.setRowData(this.missionData);

                    // Save to Database
                    this.updateRows(start);
                  }
                },
                error => {
                  this.busy = false;
                  this.dialogService.displayDebug(error);
                });
          },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      });
    }
  }

  yearSelected(year: any): void {
    this.selectedYear = year ? year.name : undefined;

    if (this.selectedYear) {
      this.busy = true;

      this.selectedPlanningPhase = this.appModel.planningData.find(obj => obj.id === this.selectedYear + '_id');

      this.planningService.getMissionPriorities(this.selectedPlanningPhase.id).subscribe(
          resp => {
            this.busy = false;
            const result = (resp as any).result;
            if (result  instanceof Array) {
              this.missionData = new Array<MissionPriority>(result.length);
              for (const mp of result as Array<MissionPriority>) {
                if (!mp.attachments) {
                  mp.attachments = [];
                }
                if (!mp.attachmentsDisabled) {
                  mp.attachmentsDisabled = false;
                }
                if (!mp.actions) {
                  mp.actions = new Action();
                  mp.actions.canUpload = false;
                  mp.actions.canSave = false;
                  mp.actions.canEdit = true;
                  mp.actions.canDelete = true;
                }
                this.missionData[mp.order - 1] = mp;
              }
            }
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
          });
    }
  }

  handleNewAttachments(newFile:FileMetaData):void{
    this.showUploadDialog = false;

    if(newFile){//undefined is returned for cancle/errors, so only proceed if we have a value

      //wrap the FileMetaData in an Attachment object
      let attachment:Attachment = new Attachment();
      attachment.file = newFile;
      attachment.mpId = this.missionData[this.selectedRowId].id;

      //add attachment
      this.missionData[this.selectedRowId].attachments.push(attachment);

      //update data
      this.gridApi.setRowData(this.missionData);
    }
  }

  onOpenPlanningPhase():void{
    if(this.yearDropDown.isValid()){
      this.dialogService.displayError("not implemented");
    }
  }

  ngOnInit() {
    this.POMManager = this.appModel.userDetails.userRole.isPOM_Manager;
    const years: string[] = [];
    const status: string[] = ['OPEN', 'LOCKED', 'CLOSED'];
    for (const item of this.appModel.planningData){
      // Opened, Locked or Closed.
      if (status.indexOf(item.state) !== -1){
        years.push(item.name);
      }
    }

    // trigger a default selection
    if (this.appModel.selectedYear) {
      this.selectedYear = this.appModel.selectedYear;
      this.appModel.selectedYear = undefined;
      this.yearSelected({name: this.selectedYear});
    }

    this.availableYears = this.toListItem(years);
  }

  private toListItem(years:string[]):ListItem[]{
    let items:ListItem[] = [];
    for(let year of years){
      let item:ListItem = new ListItem();
      item.id = year;
      item.name = year;
      item.value = year;
      if (year === this.selectedYear) {
        item.isSelected = true;
      }
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
    this.missionData[rowId].attachmentsDisabled = true;
    this.gridApi.setRowData(this.missionData);
  }

  private viewMode(rowId:number){
    // Toggle actions
    this.gridApi.stopEditing();
    this.missionData[rowId].actions.canUpload = false;
    this.missionData[rowId].actions.canSave = false;
    this.missionData[rowId].actions.canEdit = true;
    // Enable attachments dropdown
    this.missionData[rowId].attachmentsDisabled = false;
    this.gridApi.setRowData(this.missionData);
  }

  private saveRow(rowId:number){
    let errorMsg = '';
    let isError = false;

    // Note stopEditing saves edits to model.  Since changes aren't saved to server if validation fails this is ok.
    this.gridApi.stopEditing();
    const row: MissionPriority = this.missionData[rowId];

    // Check columns Title max 45 chars, description max 200 chars
    if (row.title.length <= 45 && row.title.length > 0 && row.description.length <= 200 && row.description.length > 0) {

      // Convert to server mp
      const serverMp: MissionPriority = this.convertToServerMP(row);
      serverMp.planningPhaseId = this.selectedPlanningPhase.id

      this.busy = true;

      // Create or update? Check for presence of mp id
      if (!serverMp.id) {
        this.planningService.createMissionPriority(serverMp).subscribe(
          resp => {
            this.busy = false;
            this.missionData[rowId] = (resp as any).result;

            this.missionData[rowId].actions = new Action();
            this.missionData[rowId].actions.canEdit = false;
            this.missionData[rowId].actions.canSave = true;
            this.missionData[rowId].actions.canDelete = true;
            this.missionData[rowId].actions.canUpload = true;

            // Update view
            this.viewMode(rowId);
            this.gridApi.setRowData(this.missionData);
          },
          error =>{
            this.busy = false;
            this.dialogService.displayDebug(error);
          });
      } else {
        // Ensure creation information is preserved
        this.planningService.updateMissionPriority([serverMp]).subscribe(
          resp => {
            this.busy = false;

            // Update view
            this.viewMode(rowId);
            this.gridApi.setRowData(this.missionData);
          },
          error =>{
            this.busy = false;
            this.dialogService.displayDebug(error);
          });
      }
    } else {
      if (row.title.length === 0){
        errorMsg = 'The Title is empty. ';
        isError = true;
      }
      if (row.description.length === 0){
        errorMsg = errorMsg + 'The Description is empty. ';
        isError = true;
      }
      if (row.title.length > 45){
        errorMsg = errorMsg + 'The Title is longer than the max of 45 characters. ';
        isError = true;
      }
      if (row.description.length > 200){
        errorMsg = errorMsg + 'The Description is longer than the max of 200 characters';
        isError = true;
      }
      if (isError){
        this.dialogService.displayError(errorMsg);
      }

      this.editRow(rowId);
    }
  }

  private updateRows(beginRowId: number, endRowId?: number) {
    this.busy = true;
    const clientMPs = this.missionData.slice(beginRowId, endRowId);
    // Ensure there is something to update
    if (clientMPs.length) {
      // Create copies of updated mps with client only properties excluded, server doesn't know about them
      const updateMps: MissionPriority[] = new Array<MissionPriority>();
      for (const clientMP of clientMPs) {
        updateMps.push(this.convertToServerMP(clientMP));
      }
      this.planningService.updateMissionPriority(updateMps).subscribe(
          resp => {
            this.busy = false;
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
          });
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
    this.busy = true;

    this.planningService.deleteMissionPriority(this.missionData[rowId].id).subscribe(
      resp => {
        this.missionData.splice(rowId, 1);

        for (let i = rowId; i < this.missionData.length; i++){
          this.missionData[i].order = this.missionData[i].order - 1;
        }

        // Update view
        this.gridApi.setRowData(this.missionData);

        // Let service know about ordering changes
        this.updateRows(rowId);

        this.busy = false;
      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      });
  }

  private addAttachment(rowId:number):void{
    this.selectedRowId = rowId;
    this.showUploadDialog = true;
  }

  private deleteAttachments(rowId:number){
    this.selectedRowId = rowId;
     this.selectedRow = this.missionData[rowId];
     this.showDeleteAttachmentDialog = true;
  }

  private onDeleteAttachments(): void {
    // Get number of attachments to check if any have been removed
    const attachmentCount = this.selectedRow.attachments.length;

    // Possibly removing items from array while iterating over it - do in reverse and things just work
    for (let i = this.selectedRow.attachments.length - 1; i >= 0; --i) {
      if (this.selectedRow.attachments[i].selectedForDelete === true) {
        this.selectedRow.attachments.splice(i, 1);
      }
    }

    // If the attachment count has changed update the server, otherwise notify the user to select an attachment
    if (attachmentCount !== this.selectedRow.attachments.length) {
      this.saveRow(this.selectedRowId);
      this.dialogService.displayInfo('Attachment(s) successfully deleted from the mission.');
    } else {
      this.dialogService.displayError('Select one or more attachments.');
    }
  }

  // Overwrite tab functionality to tab back and forth from title and description
  private tabToNextCell (params) {
    let rowIndex = params.previousCellPosition.rowIndex;
    let nextColumn:Column;
    let nextCell:CellPosition = params.nextCellPosition;
    // if the column is title
    if (params.previousCellPosition.column.colId === "title" && params.backwards === true){
      nextColumn = this.columnApi.getColumn("description");
      nextCell = {
        rowIndex: rowIndex,
        column: nextColumn,
        rowPinned: undefined
      }
    }
    else if (params.previousCellPosition.column.colId === "description" && params.backwards === false) {
      nextColumn = this.columnApi.getColumn("title");
      nextCell = {
        rowIndex: rowIndex,
        column: nextColumn,
        rowPinned: undefined
      }
    }
    return nextCell;
  }

  // Watches when values change
  private onValueChanged(params) {
    // check title

    // check description

    // generate error
  }

  lockPlanningPhase() {
    this.busy = true;
    this.planningService.lockPlanningPhase(this.selectedPlanningPhase).subscribe(
        resp => {
          this.busy = false;

          // Update model state
          this.selectedPlanningPhase.state = 'LOCKED';

          this.dialogService.displayToastInfo(`Planning Phase for ${this.selectedYear} successfully locked`);
        },
        error => {
          this.busy = false;
          this.dialogService.displayDebug(error);
        });
  }

  closePlanningPhase() {
    this.busy = true;
    this.planningService.closePlanningPhase(this.selectedPlanningPhase).subscribe(
        resp => {
          this.busy = false;

          // Update model state
          this.selectedPlanningPhase.state = 'CLOSED';

          this.dialogService.displayToastInfo(`Planning Phase for ${this.selectedYear} successfully closed`);
        },
        error => {
          this.busy = false;
          this.dialogService.displayDebug(error);
        });
  }

  cancelDialog() {
    this.showDeleteAttachmentDialog = false;
    this.showImportYearDialog = false;
  }

  private convertToServerMP(clientMP: MissionPriority): MissionPriority {
    // The server doesn't know anything about some client side properties of the MissionPriority.  Copy clientMP but
    // exclude those properties that the server doesn't know anything about.
    // Note - ignoring update properties due to server setting during call
    const serverMP: MissionPriority = new MissionPriority();
    serverMP.attachments = clientMP.attachments;
    serverMP.created = clientMP.created;
    serverMP.createdBy = clientMP.createdBy;
    serverMP.description = clientMP.description;
    serverMP.id = clientMP.id;
    serverMP.order = clientMP.order;
    serverMP.planningPhaseId = clientMP.planningPhaseId;
    serverMP.title = clientMP.title;
    return serverMP;
  }

}
