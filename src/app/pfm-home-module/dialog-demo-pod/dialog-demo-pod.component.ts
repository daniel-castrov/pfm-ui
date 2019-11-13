import { Component, OnInit } from '@angular/core';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { AppModel } from '../../../../projects/shared/src/lib/models/AppModel';

@Component({
  selector: 'pfm-dialog-demo-pod',
  templateUrl: './dialog-demo-pod.component.html',
  styleUrls: ['./dialog-demo-pod.component.scss']
})
export class DialogDemoPodComponent implements OnInit {

  constructor(private dialogService:DialogService, private appModel:AppModel) { }

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
