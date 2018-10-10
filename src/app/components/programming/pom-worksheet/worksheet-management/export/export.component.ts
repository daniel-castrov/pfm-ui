import {Component} from '@angular/core';
import {WorksheetService} from "../../../../../generated";
import {BaseComponent} from "../base.component";

@Component({
  selector: 'export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent extends BaseComponent {

  constructor(private worksheetService: WorksheetService) {
    super();
  }

  async onSave() {
    this.selectedWorksheet.locked = true;
    await this.worksheetService.create(this.selectedWorksheet).toPromise();
    this.operationOver.emit();
  }
}
