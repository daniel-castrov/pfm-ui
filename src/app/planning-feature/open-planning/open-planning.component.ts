import { Component, OnInit, ViewChild } from '@angular/core';
import { PlanningService } from '../services/planning-service';
import { ListItem } from '../models/ListItem';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { Router } from '@angular/router';


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

  constructor(private planningService:PlanningService, private dialogService:DialogService, private router:Router) { }

  yearSelected(year:string):void{
    this.selectedYear = year;
  }

  onOpenPlanningPhase():void{

    if(this.yearDropDown.isValid()){
      let year:any = this.selectedYear;
      this.dialogService.displayToastInfo(`Planning phase for ${ year.id } successfully created.`);
      this.router.navigate(["/planning/mission-priorities", {name: year.id}]);
    }
    else{
      this.dialogService.displayToastError(`Please select a year from the dropdown.`);
    }
  }

  ngOnInit() {
    this.busy = true;
    this.planningService.getAvailableOpenPlanningYears().subscribe(
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
