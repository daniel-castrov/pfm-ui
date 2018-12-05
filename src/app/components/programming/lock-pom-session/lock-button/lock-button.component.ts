import {Component, Input, ViewEncapsulation} from '@angular/core';
import {Pom, POMService, Worksheet, WorksheetService} from "../../../../generated";
import {Notify} from "../../../../utils/Notify";

@Component({
  selector: 'lock-button',
  templateUrl: './lock-button.component.html',
  styleUrls: ['./lock-button.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LockButtonComponent {

  @Input() pom: Pom;
  @Input() worksheets: Array<Worksheet>;
  @Input() selectedWorksheet: Worksheet;

  constructor(private pomService: POMService,
              private worksheetService: WorksheetService) {}

  lockPom() {
    this.worksheets.forEach(worksheet => {
      this.worksheetService.update({...worksheet, locked: true}).toPromise();
    });
    this.worksheetService.update({...this.selectedWorksheet, isFinal: true, locked: true}).subscribe(response => {
      this.worksheetService.updateProgramRequests(this.selectedWorksheet.id).subscribe(response => {
        this.pomService.updatePomStatus(this.pom.id, Pom.StatusEnum.RECONCILIATION).subscribe(response => {
          this.selectedWorksheet.isFinal = true;
          Notify.success('Worksheet marked as final successfully');
        })
      });
    });
  }
}
