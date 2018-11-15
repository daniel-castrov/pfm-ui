import { Component, OnInit } from '@angular/core';
import { ErrorDataService } from '../errorData.service';


@Component({
  selector: 'app-restresult-error',
  templateUrl: './restresult-error.component.html',
  styleUrls: ['./restresult-error.component.scss']
})
export class RestResultErrorComponent implements OnInit {

  constructor(private errorDataSvc:ErrorDataService) {
   }

  private message:string;

  ngOnInit() {

    let msg:any = this.errorDataSvc.errorData;

    if (typeof msg == 'string'){
      this.message = msg;
    } else {
      this.message = "Could not display the error message.  Please check the console log."
    }
    console.log(msg);
  }

}
