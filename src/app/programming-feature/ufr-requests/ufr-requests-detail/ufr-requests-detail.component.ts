import { Component, OnInit } from '@angular/core';
import { Program } from '../../models/Program';
import { ActivatedRoute, Router } from '@angular/router';
import { PomService } from '../../services/pom-service';
import { Pom } from '../../models/Pom';
import { AppModel } from 'src/app/pfm-common-models/AppModel';
import { VisibilityService } from 'src/app/services/visibility-service';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { PomStatus } from '../../models/enumerations/pom-status.model';
import { ProgramStatus } from '../../models/enumerations/program-status.model';
import { UFR } from '../../models/ufr.model';
import { UFRStatus } from '../../models/enumerations/ufr-status.model';

@Component({
  selector: 'pfm-ufr-requests-detail',
  templateUrl: './ufr-requests-detail.component.html',
  styleUrls: ['./ufr-requests-detail.component.scss']
})
export class UfrRequestsDetailComponent implements OnInit {
  pomYear: number;
  ufr: UFR;
  busy: boolean;
  pom: Pom;
  currentSelectedTab = 0;
  bacKToggle = true;
  showSubmitButton: boolean;
  showSaveButton: boolean;
  showSetDisposition: boolean;
  clickedReviewForApproval: boolean;

  constructor(
    private route: ActivatedRoute,
    private pomService: PomService,
    public appModel: AppModel,
    private visibilityService: VisibilityService,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.busy = true;
    this.pomYear = Number(this.route.snapshot.paramMap.get('pomYear'));
    // TODO Remove next 2 lines.It's a fake implemation. Use data required when data available. See PFM-487
    this.clickedReviewForApproval = true;
    this.ufr = { name: 'test', ufrStatus: UFRStatus.SAVED } as UFR;
    this.setupVisibility();
    this.pomService.getPomForYear(this.pomYear).subscribe(
      resp => {
        this.pom = (resp as any).result;
        this.showSaveButton = this.isPomCreatedOrOpen() && this.ufr.ufrStatus === UFRStatus.SAVED;
        this.showSubmitButton = this.isPomCreatedOrOpen() && this.ufr.ufrStatus === UFRStatus.SAVED;
        this.showSetDisposition =
          this.isPomCreatedOrOpen() && this.ufr.ufrStatus === UFRStatus.SAVED && this.clickedReviewForApproval;
      },
      error => this.dialogService.displayDebug(error),
      () => (this.busy = false)
    );
  }

  setupVisibility() {
    this.visibilityService
      .isCurrentlyVisible('ufr-requests-detail-component')
      .toPromise()
      .then(response => {
        this.appModel['visibilityDef']['ufr-requests-detail-component'] = (response as any).result;
      });
  }

  onSave() {}

  onSubmit() {}

  onSetDisposition() {}

  onSelectTab(event: any) {}

  goBack() {
    /** TODO Delete bacKToggle  and implement proper validation as indicated in PFM-487 when fields and grids
     * available
     */

    if (this.bacKToggle) {
      this.dialogService.displayConfirmation(
        'You have unsaved data in fields or grids on one or more tabs. ' +
          'If you continue this data will be lost. ' +
          'Do you want to continue and lose this data?',
        'Caution',
        () => {
          this.router.navigate(['/programming/ufr-requests']);
        },
        () => {},
        'Lose Data'
      );
    } else {
      this.router.navigate(['/programming/ufr-requests']);
    }
    this.bacKToggle = !this.bacKToggle;
  }

  isPomCreatedOrOpen() {
    return this.pom.status === PomStatus.CREATED || this.pom.status === PomStatus.OPEN;
  }
}
