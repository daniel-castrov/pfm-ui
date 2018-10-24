import { CreationTimeType } from './../../../../generated/model/creationTimeType';
import { WithFullNameService, ProgramWithFullName } from '../../../../services/with-full-name.service';
import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import {ProgramRequestPageModeService} from '../../program-request/page-mode.service';
import {ProgramType, User, RolesPermissionsService} from "../../../../generated";
import { UserUtils } from '../../../../services/user.utils';

enum AddNewPrForMode {
  AN_MRDB_PROGRAM = 'Previously Funded Program',
  A_NEW_INCREMENT = 'New Increment',
  A_NEW_FOS = 'New FoS',
  A_NEW_SUBPROGRAM = 'New Subprogram',
  A_NEW_PROGRAM = 'New Program'
}

@Component({
  selector: 'new-programmatic-request',
  templateUrl: './new-programmatic-request.component.html',
  styleUrls: ['./new-programmatic-request.component.scss']
})
export class NewProgrammaticRequestComponent implements OnInit {

  addNewPrForMode: AddNewPrForMode;
  @Input() pomId: string;
  allPrograms: ProgramWithFullName[];
  selectableProgramsOrPrs: ProgramWithFullName[];
  selectedProgramOrPr: ProgramWithFullName = null;
  initialSelectOption: string;

  constructor(
    private router: Router,
    private programRequestPageMode: ProgramRequestPageModeService,
    private withFullNameService: WithFullNameService,
    private userUtils: UserUtils,
    private rolesService: RolesPermissionsService
  ) {}

  async ngOnInit() {
    this.allPrograms = await this.withFullNameService.programs()
  }

  async setAddNewPrRadioMode(selection: AddNewPrForMode) {
    this.addNewPrForMode = selection;
    switch(this.addNewPrForMode) {
      case 'Previously Funded Program':
        this.selectableProgramsOrPrs = await this.withFullNameService.programsMunisPrs(this.allPrograms, this.pomId);
        this.initialSelectOption = 'Program';
        break;
      case 'New FoS':
      case 'New Increment':
        this.selectableProgramsOrPrs = await this.withFullNameService.programsPlusPrsMinusSubprograms(this.pomId);
        this.initialSelectOption = 'Program';
        break;
      case 'New Subprogram':
        this.selectableProgramsOrPrs = await this.withFullNameService.programRequestsWithFullNamesDerivedFromCreationTimeData(this.pomId);
        this.initialSelectOption = 'Program Request';
        break;
    }

    // make sure we can only add new programs in our organization
    var mgr: boolean = ('true' === (await this.rolesService.hasRole('POM_Manager').toPromise()).result );
    if (false === mgr) {
      var user: User = await this.userUtils.user().toPromise();
      this.selectableProgramsOrPrs = this.selectableProgramsOrPrs.filter(prog => (prog.organization === user.organizationId));
    }
  }

  async next() {
    switch(this.addNewPrForMode) {
      case 'Previously Funded Program':
        this.programRequestPageMode.set(CreationTimeType.PROGRAM_OF_MRDB,
          this.pomId,
          this.selectedProgramOrPr,
          ProgramType.PROGRAM);
        break;
      case 'New FoS':
        this.programRequestPageMode.programType = ProgramType.FOS;
        if(this.withFullNameService.isProgram(this.selectedProgramOrPr)) {
          this.programRequestPageMode.set(CreationTimeType.SUBPROGRAM_OF_MRDB,
            this.pomId,
            this.selectedProgramOrPr,
            ProgramType.FOS);
        } else { // a PR has been selected
          this.programRequestPageMode.set(CreationTimeType.SUBPROGRAM_OF_PR,
            this.pomId,
            this.selectedProgramOrPr,
            ProgramType.FOS);
        }
        break;
      case 'New Increment':
        if(this.withFullNameService.isProgram(this.selectedProgramOrPr)) {
          this.programRequestPageMode.set(CreationTimeType.SUBPROGRAM_OF_MRDB,
            this.pomId,
            this.selectedProgramOrPr,
            ProgramType.INCREMENT);
        } else { // a PR has been selected
          this.programRequestPageMode.set(CreationTimeType.SUBPROGRAM_OF_PR,
            this.pomId,
            this.selectedProgramOrPr,
            ProgramType.INCREMENT);
        }
        break;
      case 'New Subprogram':
        this.programRequestPageMode.set(CreationTimeType.SUBPROGRAM_OF_PR,
          this.pomId,
          this.selectedProgramOrPr,
          ProgramType.GENERIC);
        break;
      case 'New Program':
        this.programRequestPageMode.set(CreationTimeType.NEW_PROGRAM,
          this.pomId,
          null,
          ProgramType.PROGRAM);
        break;
    }
    this.router.navigate(['/program-request']);
  }

}
