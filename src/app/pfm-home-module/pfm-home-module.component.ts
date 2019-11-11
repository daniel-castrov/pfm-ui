import { Component, OnInit } from '@angular/core';
import { AppModel } from '../../../projects/shared/src/lib/models/AppModel';
import { DialogService } from '../pfm-coreui/services/dialog.service';

@Component({
  selector: 'app-pfm-home-module',
  templateUrl: './pfm-home-module.component.html',
  styleUrls: ['./pfm-home-module.component.scss']
})
export class PfmHomeModuleComponent implements OnInit {

  constructor(public appModel:AppModel, private dialogService:DialogService) { }

  displayInfo():void{
    this.dialogService.displayInfo("Sample Information Message");
  }

  displayError():void{
    this.dialogService.displayError("Sample Erorr Message");
  }

  displayDebug():void{
    this.dialogService.displayDebug(this.appModel);
  }

  displayToastInfo():void{
    this.dialogService.displayToastInfo("Sample Toast Information Message");
  }

  displayToastError():void{
    this.dialogService.displayToastError("Sample Toast Error Message");
  }

  ngOnInit() {
  }

}
