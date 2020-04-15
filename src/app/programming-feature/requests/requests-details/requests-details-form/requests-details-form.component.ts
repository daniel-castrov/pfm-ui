import { Component, OnInit, Input } from '@angular/core';
import { Program } from '../../../models/Program';
import { FormGroup, FormControl, ValidatorFn, ValidationErrors, Validators } from '@angular/forms';
import { OrganizationService } from '../../../../services/organization-service';
import { Organization } from '../../../../pfm-common-models/Organization';
import { PlanningService } from 'src/app/planning-feature/services/planning-service';
import { switchMap } from 'rxjs/operators';
import { FileMetaData } from 'src/app/pfm-common-models/FileMetaData';
import { FileDownloadService } from 'src/app/pfm-secure-filedownload/services/file-download-service';
import { TagService } from 'src/app/programming-feature/services/tag.service';
import { Tag } from 'src/app/programming-feature/models/Tag';
import { MissionPriority } from 'src/app/planning-feature/models/MissionPriority';

@Component({
  selector: 'pfm-requests-details-form',
  templateUrl: './requests-details-form.component.html',
  styleUrls: ['./requests-details-form.component.scss']
})
export class RequestsDetailsFormComponent implements OnInit {
  @Input() pomYear: number;
  @Input() program: Program;

  readonly fileArea = 'pr';

  readonly DIVISIONS = 'Divisions';
  readonly SEC_DEF_LOE = 'SecDef LOE';
  readonly STRATEGIC_IMPERATIVES = 'Strategic Imperatives';
  readonly AGENCY_OBJECTIVES = 'Agency Objectives';

  form: FormGroup;
  addMode = false;
  organizations: Organization[];
  divisions = [];
  missionPriorities: MissionPriority[];
  agencyPriorities: number[];
  directoratePriorities: number[];
  fileid: string;
  isUploading: boolean;
  imagePath: string;
  secDefLOE = [];
  strategicImperatives = [];
  agencyObjectives = [];
  showMissionPriority: boolean;
  showMissionPriorityMessage: boolean;
  missionPriorityMessage: string;

  constructor(
    private organizationService: OrganizationService,
    private planningService: PlanningService,
    private fileDownloadService: FileDownloadService,
    private tagService: TagService
  ) {}

  async ngOnInit() {
    await this.populateDropDowns();
    if (!this.program) {
      this.addMode = true;
      this.program = new Program();
    }
    this.loadImage();
    this.loadForm();
    this.updateForm(this.program);
  }

  loadForm() {
    this.form = new FormGroup(
      {
        shortName: new FormControl(this.program.shortName, [Validators.required]),
        longName: new FormControl(this.program.longName, [Validators.required]),
        type: new FormControl(this.addMode ? 'PROGRAM' : this.program.type),
        organizationId: new FormControl(
          this.program.organizationId
            ? this.organizations.find(org => org.id === this.program.organizationId).abbreviation
            : undefined,
          [Validators.required]
        ),
        divisionId: new FormControl(''),
        missionPriorityId: new FormControl('', [Validators.required]),
        agencyPriority: new FormControl(''),
        directoratePriority: new FormControl(''),
        secDefLOEId: new FormControl(''),
        strategicImperativeId: new FormControl(''),
        agencyObjectiveId: new FormControl(''),
        missionPrioritiesMessage: new FormControl({ value: this.missionPriorityMessage, disabled: true })
      },
      { validators: this.formValidator }
    );
    this.disableInputsInEditMode();
  }

  updateForm(program: Program) {
    this.form.patchValue({
      divisionId: program.divisionId,
      missionPriorityId: program.missionPriorityId,
      agencyPriority: program.agencyPriority,
      directoratePriority: program.directoratePriority,
      secDefLOEId: program.secDefLOEId,
      strategicImperativeId: program.strategicImperativeId,
      agencyObjectiveId: program.agencyObjectiveId
    });
    this.updateAgencyPriority();
  }

  async populateDropDowns() {
    this.organizations = ((await this.organizationService.getAll().toPromise()) as any).result;
    await this.planningService
      .getPlanningByYear(this.pomYear)
      .pipe(
        switchMap(planning => {
          this.showMissionPriority = true;
          return this.planningService.getMissionPrioritiesForPOM(planning.result.id);
        })
      )
      .toPromise()
      .then(
        missionPriorities => {
          this.missionPriorities = missionPriorities.result;
        },
        error => {
          // Conflict Status
          if (error.status === 409) {
            this.showMissionPriorityMessage = true;
            this.missionPriorityMessage = error.error.error;
          }
        }
      );
    this.tagService.getByType(this.DIVISIONS).subscribe(resp => {
      this.divisions = resp.result as Tag[];
    });
    this.agencyPriorities = Array.from({ length: 20 }, (x, i) => i + 1);
    this.directoratePriorities = Array.from({ length: 20 }, (x, i) => i + 1);
    this.tagService.getByType(this.SEC_DEF_LOE).subscribe(resp => {
      this.secDefLOE = resp.result as Tag[];
    });
    this.tagService.getByType(this.STRATEGIC_IMPERATIVES).subscribe(resp => {
      this.strategicImperatives = resp.result as Tag[];
    });
    this.tagService.getByType(this.AGENCY_OBJECTIVES).subscribe(resp => {
      this.agencyObjectives = resp.result as Tag[];
    });
  }

  onChangeMissionPriority(event: any) {
    this.updateAgencyPriority();
  }

  updateAgencyPriority() {
    const selectedMissionPriorityId = this.form.controls['missionPriorityId'].value;
    if (selectedMissionPriorityId && this.missionPriorities) {
      const missionPriority = this.missionPriorities.find(mission => mission.id === selectedMissionPriorityId);
      if (missionPriority) {
        this.form.controls['agencyPriority'].disable();
        this.form.patchValue({
          agencyPriority: missionPriority.order
        });
        return;
      }
    }
    this.form.controls['agencyPriority'].enable();
  }

  disableInputsInEditMode() {
    this.form.controls['type'].disable();
    if (!this.addMode) {
      this.form.controls['shortName'].disable();
      this.form.controls['organizationId'].disable();
    }
  }

  onUploading(event) {
    this.isUploading = event;
  }

  onFileUploaded(fileResponse: FileMetaData) {
    this.program.imageName = fileResponse.id;
    this.program.imageArea = this.fileArea;
    this.loadImage();
  }

  loadImage() {
    if (this.program.imageName) {
      this.fileDownloadService.downloadSecureResource(this.program.imageName).then(blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          this.imagePath = base64data.toString();
        };
      });
    }
  }

  formValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const invalidFields = {};

    // specific validations
    const shortName = control.get('shortName').value as string;
    if (this.addMode && this.program.shortName === shortName) {
      Object.assign(invalidFields, { shortName: true });
    }

    return invalidFields;
  };

  trackById(index: number, item: any) {
    return item.id;
  }
}
