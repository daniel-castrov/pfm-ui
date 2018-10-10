import {Component} from '@angular/core';
import {BaseComponent} from "../base.component";
import {WorksheetService} from "../../../../../generated";

@Component({
  selector: 'rename',
  templateUrl: './rename.component.html',
  styleUrls: ['./rename.component.scss']
})
export class RenameComponent extends BaseComponent {

  editableName: string;

  constructor(private worksheetService: WorksheetService) {
    super();
  }

  ngOnChanges() {
    super.ngOnChanges();
    this.editableName = this.name;
  }

  async onSave() {
    this.selectedWorksheet.name = this.editableName;
    await this.worksheetService.update(this.selectedWorksheet).toPromise();
    this.operationOver.emit();
  }

}
