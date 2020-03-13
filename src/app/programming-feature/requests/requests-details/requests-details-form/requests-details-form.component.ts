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
  missionPriorities: string[];
  agencyPriorities: string[];
  directoratePriorities: string[];
  fileid: string;
  isUploading: boolean;
  imagePath: string;
  secDefLOE = [];
  strategicImperatives = [];
  agencyObjectives = [];

  constructor(
    private organizationService: OrganizationService,
    private planningService: PlanningService,
    private fileDownloadService: FileDownloadService,
    private tagService: TagService
  ) { }

  async ngOnInit() {
    await this.populateDropDowns();
    if (!this.program) {
      this.addMode = true;
      this.program = new Program();
    }
    this.loadForm();
  }

  loadForm() {
    this.form = new FormGroup({
      shortName: new FormControl(this.program.shortName, [Validators.required]),
      longName: new FormControl(this.program.longName, [Validators.required]),
      type: new FormControl(this.addMode ? 'PROGRAM' : this.program.type),
      organizationId: new FormControl(
        this.program.organizationId ? this.organizations.find(
          org => org.id === this.program.organizationId
        ).abbreviation : undefined, [Validators.required]
      ),
      division: new FormControl(''),
      missionPriority: new FormControl('', [Validators.required]),
      agencyPriority: new FormControl(''),
      directoratePriority: new FormControl(''),
      secDefLOE: new FormControl(''),
      strategicImperatives: new FormControl(''),
      agencyObjectives: new FormControl(''),
    }, { validators: this.formValidator });

    this.disableInputsInEditMode();
  }

  async populateDropDowns() {
    this.organizations = (await this.organizationService.getAll().toPromise() as any).result;
    this.planningService.getPlanningByYear(this.pomYear)
      .pipe(switchMap(planning => this.planningService.getMissionPriorities(planning.result.id)))
      .subscribe(missionPriorities => {
        this.missionPriorities = missionPriorities.result.map(mission => mission.title);
      });
    this.tagService.getByType(this.DIVISIONS)
      .subscribe(resp => {
        this.divisions = resp.result as Tag[];
      });
    this.agencyPriorities = [].constructor(20);
    this.directoratePriorities = [].constructor(20);
    this.tagService.getByType(this.SEC_DEF_LOE)
      .subscribe(resp => {
        this.secDefLOE = resp.result as Tag[];
      });
    this.tagService.getByType(this.STRATEGIC_IMPERATIVES)
      .subscribe(resp => {
        this.strategicImperatives = resp.result as Tag[];
      });
    this.tagService.getByType(this.AGENCY_OBJECTIVES)
      .subscribe(resp => {
        this.agencyObjectives = resp.result as Tag[];
      });
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
    this.fileDownloadService.downloadSecureResource(this.program.imageName).then(blob => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        this.imagePath = base64data.toString();
      };
    });
  }

  formValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const invalidFields = {};

    // specific validations
    const shortName = control.get('shortName').value as string;
    if (this.addMode && this.program.shortName === shortName) {
      Object.assign(invalidFields, { shortName: true });
    }

    return invalidFields;
  }
}
