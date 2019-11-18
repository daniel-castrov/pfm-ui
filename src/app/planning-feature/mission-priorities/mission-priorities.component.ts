import { Component, OnInit, ViewChild } from '@angular/core';
import { PlanningService } from '../services/planning-service';
import { ListItem } from '../models/ListItem';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { DialogService } from '../../pfm-coreui/services/dialog.service';

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

  constructor(private planningService:PlanningService, private dialogService:DialogService) { }

  yearSelected(year:string):void{
    this.selectedYear = year;
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
