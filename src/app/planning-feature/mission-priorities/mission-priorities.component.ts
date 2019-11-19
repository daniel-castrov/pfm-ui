import { Component, OnInit, ViewChild } from '@angular/core';
import { PlanningService } from '../services/planning-service';
import { ListItem } from '../models/ListItem';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { MissionPriority } from '../models/MissionPriority';
import { ActionCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { AttachmentCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/attachment-cell-renderer/attachment-cell-renderer.component';

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
      {headerName: 'Priority', field: 'priority', width: 100, resizable: true,type: "numericColumn"},
      {headerName: 'Mission Title', field: 'title', width: 250, resizable: true, editable: true , onCellValueChanged: (params)=>{this.editOfMissionTitle(params)}},
      {headerName: 'Mission Description', field: 'description', width: 450,resizable: true, editable: true, onCellValueChanged: (params)=>{this.editOfMissionDescription(params)}},
      {headerName: 'Attachments', field: 'attachments', width: 350, cellRendererFramework: AttachmentCellRendererComponent , resizable: true},
      {headerName: 'Actions', field: 'actions', width: 350, cellRendererFramework: ActionCellRendererComponent, resizable: true  }
    ];

  }

  editOfMissionTitle(event:any):void{
    this.dialogService.displayInfo("title new value:" + event.newValue);
  }

  editOfMissionDescription(event:any):void{
    this.dialogService.displayInfo("desc new value:" + event.newValue);
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
