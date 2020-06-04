import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PomService } from '../../services/pom-service';
import { Pom } from '../../models/Pom';
import { AppModel } from 'src/app/pfm-common-models/AppModel';
import { VisibilityService } from 'src/app/services/visibility-service';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { PomStatus } from '../../models/enumerations/pom-status.model';
import { UFR } from '../../models/ufr.model';
import { UFRStatus } from '../../models/enumerations/ufr-status.model';
import { ShortyType } from '../../models/enumerations/shorty-type.model';
import { UfrService } from '../../services/ufr-service';
import { switchMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
  selectUfrId: string;

  constructor(
    private route: ActivatedRoute,
    private pomService: PomService,
    public appModel: AppModel,
    private visibilityService: VisibilityService,
    private dialogService: DialogService,
    private router: Router,
    private ufrService: UfrService
  ) {}

  ngOnInit(): void {
    this.pomYear = Number(this.route.snapshot.paramMap.get('pomYear'));
    // TODO Remove fake implemation below. Use data required when data available. See PFM-487
    this.clickedReviewForApproval = true;

    this.selectUfrId = this.route.snapshot.paramMap.get('id');
    this.ufrService
      .getById(this.selectUfrId)
      .pipe(
        switchMap(resp => {
          this.ufr = (resp as any).result as UFR;
          return this.pomService.getPomForYear(this.pomYear);
        }),
        catchError(error => {
          return throwError(error);
        })
      )
      .subscribe(
        resp => {
          this.pom = (resp as any).result;
          this.showSaveButton = this.isPomCreatedOrOpen() && this.ufr.ufrStatus === UFRStatus.SAVED;
          this.showSubmitButton = this.isPomCreatedOrOpen() && this.ufr.ufrStatus === UFRStatus.SAVED;
          this.showSetDisposition =
            this.isPomCreatedOrOpen() && this.ufr.ufrStatus === UFRStatus.SAVED && this.clickedReviewForApproval;
        },
        error => {
          this.dialogService.displayDebug(error);
          // TODO This prabably should probably go when loading real data
          if (!this.ufr) {
            this.ufr = new UFR();
            this.ufr.created = new Date();
            this.ufr.modified = new Date();
            this.ufr.shortName = 'Program ID';
            this.ufr.longName = 'Program Name';
            this.ufr.type = 'PROGRAM';
            this.ufr.organizationId = '5ed7c10510f2113665b64e2c'; // JPEO-CBRND
            this.ufr.divisionId = '5ed7c10510f2113665b64e0e'; // DOD
            this.ufr.missionPriorityId = null;
            this.ufr.agencyPriority = 1;
            this.ufr.directoratePriority = 1;
            this.ufr.secDefLOEId = '5ed7c10510f2113665b64dfc'; // Improve Physical and Procedural Security
            this.ufr.strategicImperativeId = '5ed7c10510f2113665b64e03'; // Agility
            this.ufr.agencyObjectiveId = '5ed7c10510f2113665b64e07'; // Make the world safer
            this.ufr.shortyType = ShortyType.NEW_FOS_FOR_PR;
          }
        }
      );

    this.setupVisibility();
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
