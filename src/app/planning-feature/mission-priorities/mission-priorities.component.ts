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

@Component({
  selector: 'pfm-planning',
  templateUrl: './mission-priorities.component.html',
  styleUrls: ['./mission-priorities.component.scss']
})
export class MissionPrioritiesComponent implements OnInit {

  @ViewChild(DropdownComponent, {static: false}) yearDropDown: DropdownComponent;

  id:string = 'mission-priorities-component';
  busy:boolean;
  availableYears:ListItem[];
  selectedYear:string;
  missionData:MissionPriority[];

  columns:any[];

  constructor(private planningService:PlanningService, private dialogService:DialogService) {
    this.columns = [
      {headerName: 'Priority', field: 'priority', width: 100, resizable: true,valueGetter: function(params) {
        return params.node.rowIndex + 1;
      }},
      {headerName: 'Mission Title', field: 'title', width: 250, editable:true, onCellValueChanged: (params)=>{this.editOfMissionTitle(params)}, cellRendererFramework: TextCellRendererComponent, cellEditorFramework: TextCellEditorComponent},
      {headerName: 'Mission Description', field: 'description', width: 450, editable: true, onCellValueChanged: (params)=>{this.editOfMissionDescription(params)}},
      {headerName: 'Attachments', field: 'attachments', width: 250, cellRendererFramework: AttachmentCellRendererComponent},
      {headerName: 'Actions', field: 'actions', width: 250, cellRendererFramework: ActionCellRendererComponent}
    ];

  }

  handleCellAction(cellAction:DataGridMessage):void{
    //this.dialogService.displayDebug(cellAction);
  }

  editOfMissionTitle(event:any):void{
    //this.missionData[event.rowIndex].missionData = event.oldValue;

    this.missionData[event.params.rowIndex][event.params.column.colId] = event.newValue;

    let update:any = {
      'update': [this.missionData[event.params.rowIndex]]
    }
    event.params.api.updateRowData(update);
  }

  editOfMissionDescription(event:any):void{
    //this.dialogService.displayInfo("desc new value:" + event.newValue);
  }

  yearSelected(year:string):void{
    this.selectedYear = year;

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
}
