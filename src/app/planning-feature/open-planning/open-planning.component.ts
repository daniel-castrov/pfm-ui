import { Component, OnInit, ViewChild } from '@angular/core';
import { PlanningService } from '../services/planning-service';
import { ListItem } from '../models/ListItem';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { Router } from '@angular/router';
import { AppModel } from '../../pfm-common-models/AppModel';


@Component({
  selector: 'pfm-planning',
  templateUrl: './open-planning.component.html',
  styleUrls: ['./open-planning.component.scss']
})
export class OpenPlanningComponent implements OnInit {

  @ViewChild(DropdownComponent, {static: false}) yearDropDown: DropdownComponent;

  id:string = 'open-planning-component';
  busy:boolean;
  availableYears:ListItem[];
  selectedYear:string;

  constructor(private appModel:AppModel, private planningService:PlanningService, private dialogService:DialogService, private router:Router) { }

  yearSelected(year:ListItem):void{
    this.selectedYear = year.value;
  }

  onOpenPlanningPhase():void{

    if(this.yearDropDown.isValid()){
      this.busy = true;
      let year:any = this.selectedYear;
      let planningData = this.appModel.planningData.find( obj => obj.id === year + "_id");
      this.planningService.openPlanningPhase(planningData).subscribe(
        resp => {
          this.busy = false;
          this.appModel.selectedYear = year;//we can use the appModel to share state information between screens
          this.dialogService.displayToastInfo(`Planning phase for ${ year } successfully opened.`);
          this.router.navigate(["/planning/mission-priorities"]);
        },
        error =>{
          this.busy = false;
          this.dialogService.displayDebug(error);
        });
    }
    else{
      this.dialogService.displayToastError(`Please select a year from the dropdown.`);
    }
  }

  ngOnInit() {
    let years:string[] = [];
    for(let item of this.appModel.planningData){
      if(item.state === "CREATED"){
        years.push(item.name);
      }
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
      items.push(item);
    }
    return items;
  }

}
