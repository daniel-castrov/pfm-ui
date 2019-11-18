import { Component, OnInit, ViewChild } from '@angular/core';
import { PlanningService } from '../services/planning-service';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { UserRole } from '../../pfm-common-models/UserRole';
import { ListItem } from '../models/ListItem';
import { InputWrapperComponent } from '../../pfm-coreui/form-inputs/input-wrapper/input-wrapper.component';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';

@Component({
  selector: 'pfm-planning',
  templateUrl: './create-planning.component.html',
  styleUrls: ['./create-planning.component.scss']
})
export class CreatePlanningComponent implements OnInit {
  @ViewChild(DropdownComponent, {static: false}) yearDropDown: DropdownComponent;

  id:string = 'create-planning-component';
  busy:boolean;
  availableYears:ListItem[];
  selectedYear:string;

  constructor(private planningService:PlanningService, private dialogService:DialogService) { }

  yearSelected(year:string):void{
    this.selectedYear = year;
  }

  onCreatePlanningPhase():void{

    if(this.yearDropDown.isValid()){
      this.dialogService.displayError("not implemented");
    }

  }

  ngOnInit() {
    this.busy = true;
    this.planningService.getAvailableCreatePlanningYears().subscribe(
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
