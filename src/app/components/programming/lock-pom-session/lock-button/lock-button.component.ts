import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Pom, POMService, Worksheet, WorksheetService} from "../../../../generated";
import {Notify} from "../../../../utils/Notify";
import {LockedWorksheetsComponent} from "../locked-worksheets/locked-worksheets.component";
import {GridToaComponent} from "../../update-pom-session/grid-toa/grid-toa.component";
import {ConfirmationDialogComponent} from "../../../confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: 'lock-button',
  templateUrl: './lock-button.component.html',
  styleUrls: ['./lock-button.component.scss'],
})
export class LockButtonComponent {

  @Input() pom: Pom;
  @Input() worksheets: Array<Worksheet>;
  @Input() lockedWorksheetsComponent: LockedWorksheetsComponent;
  @Input() selectedWorksheet: Worksheet;
  @Input() gridToaComponent: GridToaComponent;

  @Output() locked = new EventEmitter();

  @ViewChild('lockConfirmationDialog') dialog: ConfirmationDialogComponent;

  constructor(private pomService: POMService,
              private worksheetService: WorksheetService) {}

  openDialog(){
    if (!this.gridToaComponent.isToaExceeded) {
      this.dialog.open();
    } else {
      Notify.error('This worksheet is exceeding the TOA');
    }
  }

  async lockPom() {
    await this.worksheetService.update({...this.selectedWorksheet, isFinal: true}).toPromise();
    await this.worksheetService.updateProgramRequests(this.selectedWorksheet.id).toPromise();
    await this.pomService.updatePomStatus(this.pom.id, Pom.StatusEnum.RECONCILIATION).toPromise();
    this.selectedWorksheet.isFinal = true;
    Notify.success('Worksheet marked as final successfully');
    this.locked.emit(null);
  }
}
