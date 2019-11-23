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

  handleCellAction(cellAction:DataGridMessage):void{
    //this.dialogService.displayDebug(cellAction);
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
}
