import { Component, OnInit, Input } from '@angular/core';
import { UFR } from 'src/app/programming-feature/models/ufr.model';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { OrganizationService } from 'src/app/services/organization-service';
import { Organization } from 'src/app/pfm-common-models/Organization';
import { switchMap, catchError } from 'rxjs/operators';
import { TagService } from 'src/app/programming-feature/services/tag.service';
import { MissionPriority } from 'src/app/planning-feature/models/MissionPriority';
import { PlanningService } from 'src/app/planning-feature/services/planning-service';
import { FileDownloadService } from 'src/app/pfm-secure-filedownload/services/file-download-service';
import { ShortyType } from 'src/app/programming-feature/models/enumerations/shorty-type.model';
import { FileMetaData } from 'src/app/pfm-common-models/FileMetaData';
import { Tag } from 'src/app/programming-feature/models/Tag';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { of, iif } from 'rxjs';
import { ProgrammingService } from 'src/app/programming-feature/services/programming-service';
import { Program } from 'src/app/programming-feature/models/Program';
import { MrdbService } from 'src/app/programming-feature/services/mrdb-service';

@Component({
  selector: 'pfm-ufr-program-form',
  templateUrl: './ufr-program-form.component.html',
  styleUrls: ['./ufr-program-form.component.scss']
})
export class UfrProgramFormComponent implements OnInit {
  @Input() pomYear: number;
  @Input() ufr: UFR;

  readonly DIVISIONS = 'Divisions';
  readonly SEC_DEF_LOE = 'SecDef LOE';
  readonly STRATEGIC_IMPERATIVES = 'Strategic Imperatives';
  readonly AGENCY_OBJECTIVES = 'Agency Objectives';
  readonly fileArea = 'pr';

  form: FormGroup;
  organizations: Organization[];
  divisions = [];
  missionPriorities: MissionPriority[];
  agencyPriorities: number[];
  directoratePriorities: number[];
  secDefLOE = [];
  strategicImperatives = [];
  agencyObjectives = [];
  imagePath: string;
  isUploading: boolean;
  addMode = false;
  missionPriorityMessage: string;
  showMissionPriority: boolean;
  showMissionPriorityMessage: boolean;
  showParentProgram: boolean;
  parentProgramName: string;
  editMode: boolean;

  constructor(
    private organizationService: OrganizationService,
    private tagService: TagService,
    private planningService: PlanningService,
    private fileDownloadService: FileDownloadService,
    private dialogService: DialogService,
    private programmingService: ProgrammingService,
    private mrdbService: MrdbService
  ) {}

  ngOnInit() {
    this.showParentProgram =
      this.ufr.shortyType === ShortyType.NEW_FOS_FOR_MRDB_PROGRAM ||
      this.ufr.shortyType === ShortyType.NEW_FOS_FOR_PR ||
      this.ufr.shortyType === ShortyType.NEW_FOS ||
      this.ufr.shortyType === ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM ||
      this.ufr.shortyType === ShortyType.NEW_INCREMENT_FOR_PR ||
      this.ufr.shortyType === ShortyType.NEW_INCREMENT;

    if (
      this.ufr.shortyType === ShortyType.NEW_PROGRAM ||
      this.ufr.shortyType === ShortyType.NEW_FOS_FOR_MRDB_PROGRAM ||
      this.ufr.shortyType === ShortyType.NEW_FOS_FOR_PR ||
      this.ufr.shortyType === ShortyType.NEW_FOS ||
      this.ufr.shortyType === ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM ||
      this.ufr.shortyType === ShortyType.NEW_INCREMENT_FOR_PR ||
      this.ufr.shortyType === ShortyType.NEW_INCREMENT
    ) {
      this.addMode = true;
    }
    this.populateDropDownsAndLoadForm();
    this.editMode = history.state.editMode || false;
  }

  loadForm() {
    if (this.addMode) {
      this.form = new FormGroup(
        {
          shortName: new FormControl(this.ufr.shortName),
          longName: new FormControl(this.ufr.longName, [Validators.required]),
          type: new FormControl(this.ufr.type),
          programId: new FormControl(this.parentProgramName),
          organizationId: new FormControl(
            this.ufr.shortyType === ShortyType.NEW_PROGRAM
              ? this.ufr.organizationId
                ? this.organizations.find(org => org.id === this.ufr.organizationId).abbreviation
                : undefined
              : this.ufr.organizationId,
            [Validators.required]
          ),
          divisionId: new FormControl(this.ufr.divisionId),
          missionPriorityId: new FormControl(this.ufr.missionPriorityId),
          agencyPriority: new FormControl(this.ufr.agencyPriority),
          directoratePriority: new FormControl(this.ufr.directoratePriority),
          secDefLOEId: new FormControl(this.ufr.secDefLOEId),
          strategicImperativeId: new FormControl(this.ufr.strategicImperativeId),
          agencyObjectiveId: new FormControl(this.ufr.agencyObjectiveId),
          missionPrioritiesMessage: new FormControl({ value: this.missionPriorityMessage, disabled: true })
        },
        { validators: this.formValidator }
      );
    } else {
      this.form = new FormGroup(
        {
          shortName: new FormControl(this.ufr.shortName),
          longName: new FormControl(this.ufr.longName, [Validators.required]),
          type: new FormControl(this.ufr.type),
          programId: new FormControl(this.parentProgramName),
          organizationId: new FormControl(
            this.ufr.organizationId
              ? this.organizations.find(org => org.id === this.ufr.organizationId).abbreviation
              : undefined,
            [Validators.required]
          ),
          divisionId: new FormControl(
            this.ufr.divisionId ? this.divisions.find(div => div.id === this.ufr.divisionId).name : undefined
          ),
          missionPriorityId: new FormControl(
            this.ufr.missionPriorityId
              ? this.missionPriorities.find(m => m.id === this.ufr.missionPriorityId).title
              : undefined
          ),
          agencyPriority: new FormControl(this.ufr.agencyPriority),
          directoratePriority: new FormControl(this.ufr.directoratePriority),
          secDefLOEId: new FormControl(
            this.ufr.secDefLOEId ? this.secDefLOE.find(sec => sec.id === this.ufr.secDefLOEId).name : undefined
          ),
          strategicImperativeId: new FormControl(
            this.ufr.strategicImperativeId
              ? this.strategicImperatives.find(si => si.id === this.ufr.strategicImperativeId).name
              : undefined
          ),
          agencyObjectiveId: new FormControl(
            this.ufr.agencyObjectiveId
              ? this.agencyObjectives.find(ao => ao.id === this.ufr.agencyObjectiveId).name
              : undefined
          ),
          missionPrioritiesMessage: new FormControl({ value: this.missionPriorityMessage, disabled: true })
        },
        { validators: this.formValidator }
      );
    }

    this.disableInputsInEditMode();
  }

  disableInputsInEditMode() {
    this.form.controls['shortName'].disable();
    this.form.controls['type'].disable();
    this.form.controls['programId'].disable();

    if (this.ufr.shortyType === ShortyType.NEW_PROGRAM || !this.addMode) {
      this.form.controls['organizationId'].disable();
    }

    if (!this.addMode) {
      this.form.controls['longName'].disable();
      this.form.controls['divisionId'].disable();
      this.form.controls['missionPriorityId'].disable();
      this.form.controls['agencyPriority'].disable();
      this.form.controls['directoratePriority'].disable();
      this.form.controls['secDefLOEId'].disable();
      this.form.controls['strategicImperativeId'].disable();
      this.form.controls['agencyObjectiveId'].disable();
    }
  }
  populateDropDownsAndLoadForm() {
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
          return iif(
            () =>
              this.ufr.shortyType === ShortyType.NEW_FOS_FOR_MRDB_PROGRAM ||
              this.ufr.shortyType === ShortyType.NEW_FOS_FOR_PR ||
              this.ufr.shortyType === ShortyType.NEW_FOS ||
              this.ufr.shortyType === ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM ||
              this.ufr.shortyType === ShortyType.NEW_INCREMENT_FOR_PR ||
              this.ufr.shortyType === ShortyType.NEW_INCREMENT,
            this.programmingService.getProgramById(this.ufr.parentId).pipe(
              catchError(error => of(undefined)),
              switchMap(prog => {
                if (prog) {
                  const program = (prog as any).result as Program;
                  this.parentProgramName = program.shortName + ' - ' + program.longName;
                  return of(undefined);
                }
                return this.mrdbService.getById(this.ufr.parentId);
              }),
              catchError(error => of(undefined)),
              switchMap(prog => {
                if (prog) {
                  const program = (prog as any).result as Program;
                  this.parentProgramName = program.shortName + ' - ' + program.longName;
                }
                return of(undefined);
              })
            ),
            of(undefined)
          );
        })
      )
      .subscribe(() => {
        this.agencyPriorities = Array.from({ length: 20 }, (x, i) => i + 1);
        this.directoratePriorities = Array.from({ length: 20 }, (x, i) => i + 1);
        this.loadForm();
        this.changeEditMode(this.editMode);
      });
  }

  loadImage() {
    if (this.ufr.imageName) {
      this.fileDownloadService.downloadSecureResource(this.ufr.imageName).then(blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          this.imagePath = base64data.toString();
        };
      });
    }
  }

  onUploading(event) {
    if (this.ufr.shortyType === ShortyType.NEW_PROGRAM) {
      this.isUploading = event;
    }
  }

  onFileUploaded(fileResponse: FileMetaData) {
    this.ufr.imageName = fileResponse.id;
    this.ufr.imageArea = this.fileArea;
    this.loadImage();
  }

  formValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const invalidFields = {};

    // specific validations
    const shortName = control.get('shortName').value as string;
    if (this.addMode && this.ufr.shortName === shortName) {
      Object.assign(invalidFields, { shortName: true });
    }

    return invalidFields;
  };

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

  updateForm(ufr: UFR) {
    this.form.patchValue({
      divisionId: ufr.divisionId,
      missionPriorityId: ufr.missionPriorityId,
      agencyPriority: ufr.agencyPriority,
      directoratePriority: ufr.directoratePriority,
      secDefLOEId: ufr.secDefLOEId,
      strategicImperativeId: ufr.strategicImperativeId,
      agencyObjectiveId: ufr.agencyObjectiveId
    });
    this.updateAgencyPriority();
  }

  changeEditMode(editMode: boolean) {
    this.editMode = editMode;

    if (this.addMode && editMode) {
      this.form.get('longName').enable();
      if (this.ufr.shortyType === ShortyType.NEW_PROGRAM) {
        this.form.get('organizationId').disable();
      } else {
        this.form.get('organizationId').enable();
      }
      this.form.get('divisionId').enable();
      this.form.get('missionPriorityId').enable();
      this.form.get('agencyPriority').enable();
      this.form.get('directoratePriority').enable();
      this.form.get('secDefLOEId').enable();
      this.form.get('strategicImperativeId').enable();
      this.form.get('agencyObjectiveId').enable();
      this.form.patchValue({
        organizationId:
          this.ufr.shortyType === ShortyType.NEW_PROGRAM
            ? this.ufr.organizationId
              ? this.organizations.find(org => org.id === this.ufr.organizationId).abbreviation
              : undefined
            : this.ufr.organizationId,
        divisionId: this.ufr.divisionId,
        missionPriorityId: this.ufr.missionPriorityId,
        secDefLOEId: this.ufr.secDefLOEId,
        strategicImperativeId: this.ufr.strategicImperativeId,
        agencyObjectiveId: this.ufr.agencyObjectiveId
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
        organizationId: this.ufr.organizationId
          ? this.organizations.find(org => org.id === this.ufr.organizationId).abbreviation
          : undefined,
        divisionId: this.ufr.divisionId ? this.divisions.find(div => div.id === this.ufr.divisionId).name : undefined,
        missionPriorityId: this.ufr.missionPriorityId
          ? this.missionPriorities.find(m => m.id === this.ufr.missionPriorityId).title
          : undefined,
        secDefLOEId: this.ufr.secDefLOEId
          ? this.secDefLOE.find(sec => sec.id === this.ufr.secDefLOEId).name
          : undefined,
        strategicImperativeId: this.ufr.strategicImperativeId
          ? this.strategicImperatives.find(si => si.id === this.ufr.strategicImperativeId).name
          : undefined,
        agencyObjectiveId: this.ufr.agencyObjectiveId
          ? this.agencyObjectives.find(ao => ao.id === this.ufr.agencyObjectiveId).name
          : undefined
      });
    }
  }
}
