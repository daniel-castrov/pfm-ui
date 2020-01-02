import { Component, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PluginLoaderService } from '../../services/plugin-loader/plugin-loader.service';
import { AppModel } from '../../pfm-common-models/AppModel';
import { PlanningService } from '../services/planning-service';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { ActivatedRoute } from '@angular/router';
import { GridApi, ColumnApi } from '@ag-grid-community/core';
import { ListItem } from '../../pfm-common-models/ListItem';
import { SigninService } from '../../pfm-auth-module/services/signin.service';
import {DropdownComponent} from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';

@Component({
  selector: 'pfm-planning',
  templateUrl: './lock-planning.component.html',
  styleUrls: ['./lock-planning.component.scss']
})
export class LockPlanningComponent implements OnInit {
  @ViewChild(DropdownComponent, {static: false}) yearDropDown: DropdownComponent;

  gridApi:GridApi;
  columnApi:ColumnApi;
  id:string = 'mission-priorities-component';
  busy:boolean;
  actionInProgress:boolean = false;
  availableYears: ListItem[];
  selectedYear:string;
  validInput:boolean = false;
  POMManager:boolean = false;

  constructor(private appModel:AppModel, private planningService:PlanningService, private dialogService:DialogService, private route:ActivatedRoute, private signInService:SigninService) { }

  ngOnInit() {
    this.POMManager = this.appModel.userDetails.userRole.isPOM_Manager;
    let years:string[] = [];
    for(let item of this.appModel.planningData){
      if(item.state === "OPEN"){
        years.push(item.name);
      }
    }
    this.availableYears = this.toListItem(years);
  }

  lockPlanningPhase(){
    this.busy = true;
    if(this.yearDropDown.isValid()) {
      let planningData = this.appModel.planningData.find(obj => obj.id === this.selectedYear + "_id");
      this.planningService.lockPlanningPhase(planningData).subscribe(
          resp => {
            this.busy = false;

            // Update shared model state
            this.appModel.selectedYear = this.selectedYear;
            planningData.state = 'LOCKED';

            this.dialogService.displayToastInfo(`Planning Phase for ${this.selectedYear} successfully locked`);
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
          });
    } else {
      this.dialogService.displayToastError(`Please select a year from the dropdown.`);
    }
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
  }

  yearSelected(item:any):void{
    this.selectedYear = item ? item.name : undefined;    
  }

}
