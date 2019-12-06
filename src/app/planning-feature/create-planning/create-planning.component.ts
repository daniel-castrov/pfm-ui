import { Component, OnInit, ViewChild } from '@angular/core';
import { PlanningService } from '../services/planning-service';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { ListItem } from '../models/ListItem';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { TextInputComponent } from '../../pfm-coreui/form-inputs/text-input/text-input.component';
import { PasswordInputComponent } from '../../pfm-coreui/form-inputs/password-input/password-input.component';
import { ZipcodeInputComponent } from '../../pfm-coreui/form-inputs/zipcode-input/zipcode-input.component';
import { EmailInputComponent } from '../../pfm-coreui/form-inputs/email-input/email-input.component';
import { PhoneInputComponent } from '../../pfm-coreui/form-inputs/phone-input/phone-input.component';
import { Router } from '@angular/router';

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

  constructor(private planningService:PlanningService, private dialogService:DialogService, private router:Router) { }

  yearSelected(year:string):void{
    this.selectedYear = year;
  }

  onCreatePlanningPhase():void{
    let year:any = this.selectedYear;
    if(this.yearDropDown.isValid()){
      this.planningService.openPOM().subscribe(resp => {
      });
      this.dialogService.displayToastInfo(`Planning phase for ${ year.id } successfully created.`);
      this.router.navigate(["home"]);
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
