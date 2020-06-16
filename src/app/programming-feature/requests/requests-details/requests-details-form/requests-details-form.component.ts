import { Component, OnInit, Input } from '@angular/core';
import { Program } from '../../../models/Program';
import { FormGroup, FormControl, ValidatorFn, ValidationErrors, Validators } from '@angular/forms';
import { OrganizationService } from '../../../../services/organization-service';
import { Organization } from '../../../../pfm-common-models/Organization';
import { PlanningService } from 'src/app/planning-feature/services/planning-service';
import { switchMap, catchError } from 'rxjs/operators';
import { FileMetaData } from 'src/app/pfm-common-models/FileMetaData';
import { FileDownloadService } from 'src/app/pfm-secure-filedownload/services/file-download-service';
import { TagService } from 'src/app/programming-feature/services/tag.service';
import { Tag } from 'src/app/programming-feature/models/Tag';
import { MissionPriority } from 'src/app/planning-feature/models/MissionPriority';
import { MrdbService } from 'src/app/programming-feature/services/mrdb-service';
import { of } from 'rxjs';

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
  isPreviousYear = false;
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
  editMode: boolean;

  constructor(
    private organizationService: OrganizationService,
    private planningService: PlanningService,
    private fileDownloadService: FileDownloadService,
    private tagService: TagService,
    private mrdbService: MrdbService
  ) {}

  ngOnInit() {
    this.populateDropDowns();
    if (!this.program) {
      this.addMode = true;
      this.program = new Program();
    }
    this.loadImage();
    this.editMode = history.state.editMode;
  }

  loadForm() {
    this.form = new FormGroup(
      {
        shortName: new FormControl(this.program.shortName, [Validators.required]),
        longName: new FormControl(this.program.longName, [Validators.required]),
        type: new FormControl(this.addMode ? 'PROGRAM' : this.program.type),
        organizationId: new FormControl(
          this.program.organizationId
            ? this.organizations.find(org => org.id === this.program.organizationId).id
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

  populateDropDowns() {
    this.organizationService
      .getAll()
      .pipe(
        switchMap(resp => {
          this.organizations = (resp as any).result;
          return this.planningService.getPlanningByYear(this.pomYear);
        }),
        switchMap(planning => {
          this.showMissionPriority = true;
          return this.planningService.getMissionPrioritiesForPOM(planning.result.id);
        }),
        catchError(error => {
          if (error?.status === 409) {
            this.showMissionPriorityMessage = true;
            this.missionPriorityMessage = error.error.error;
          }
          return of(undefined);
        }),
        switchMap(missionPriorities => {
          if (missionPriorities) {
            this.missionPriorities = missionPriorities.result;
          }
          return this.tagService.getByType(this.DIVISIONS);
        }),
        switchMap(resp => {
          this.divisions = resp.result as Tag[];
          return this.tagService.getByType(this.SEC_DEF_LOE);
        }),
        switchMap(resp => {
          this.secDefLOE = resp.result as Tag[];
          return this.tagService.getByType(this.STRATEGIC_IMPERATIVES);
        }),
        switchMap(resp => {
          this.strategicImperatives = resp.result as Tag[];
          return this.tagService.getByType(this.AGENCY_OBJECTIVES);
        }),
        switchMap(resp => {
          this.agencyObjectives = resp.result as Tag[];
          return this.mrdbService.getByName(this.program.shortName);
        })
      )
      .subscribe(resp => {
        if (resp.result) {
          this.isPreviousYear = true;
        }
        this.agencyPriorities = Array.from({ length: 20 }, (x, i) => i + 1);
        this.directoratePriorities = Array.from({ length: 20 }, (x, i) => i + 1);

        this.loadForm();
        this.updateForm(this.program);
        this.changeEditMode(this.editMode);
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
      if (!this.isPreviousYear) {
        this.form.controls['organizationId'].disable();
      }
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

  changeEditMode(editMode: boolean) {
    this.editMode = editMode;

    if (editMode) {
      this.form.get('longName').enable();
      this.form.get('organizationId').enable();
      this.form.get('divisionId').enable();
      this.form.get('missionPriorityId').enable();
      this.form.get('agencyPriority').enable();
      this.form.get('directoratePriority').enable();
      this.form.get('secDefLOEId').enable();
      this.form.get('strategicImperativeId').enable();
      this.form.get('agencyObjectiveId').enable();
      this.form.patchValue({
        organizationId: this.program.organizationId,
        divisionId: this.program.divisionId,
        missionPriorityId: this.program.missionPriorityId,
        secDefLOEId: this.program.secDefLOEId,
        strategicImperativeId: this.program.strategicImperativeId,
        agencyObjectiveId: this.program.agencyObjectiveId
      });
    } else {
      this.form.get('longName').disable();
      this.form.get('organizationId').disable();
      this.form.get('divisionId').disable();
      this.form.get('missionPriorityId').disable();
      this.form.get('agencyPriority').disable();
      this.form.get('directoratePriority').disable();
      this.form.get('secDefLOEId').disable();
      this.form.get('strategicImperativeId').disable();
      this.form.get('agencyObjectiveId').disable();
      this.form.patchValue({
        organizationId: this.program.organizationId
          ? this.organizations.find(org => org.id === this.program.organizationId).abbreviation
          : undefined,
        divisionId: this.program.divisionId
          ? this.divisions.find(div => div.id === this.program.divisionId).name
          : undefined,
        missionPriorityId: this.program.missionPriorityId
          ? this.missionPriorities.find(m => m.id === this.program.missionPriorityId).title
          : undefined,
        secDefLOEId: this.program.secDefLOEId
          ? this.secDefLOE.find(sec => sec.id === this.program.secDefLOEId).name
          : undefined,
        strategicImperativeId: this.program.strategicImperativeId
          ? this.strategicImperatives.find(si => si.id === this.program.strategicImperativeId).name
          : undefined,
        agencyObjectiveId: this.program.agencyObjectiveId
          ? this.agencyObjectives.find(ao => ao.id === this.program.agencyObjectiveId).name
          : undefined
      });
    }
  }
}
