import {Component} from '@angular/core';
import {WorksheetService} from "../../../../../generated";
import {BaseComponent} from "../base.component";

@Component({
  selector: 'duplicate',
  templateUrl: './duplicate.component.html',
  styleUrls: ['./duplicate.component.scss']
})
export class DuplicateComponent extends BaseComponent {

  constructor(private worksheetService: WorksheetService) {
    super();
  }

  async onSave() {
    await this.worksheetService.create({...this.selectedWorksheet, id:null}).toPromise();
    this.operationOver.emit();
  }

}
