import {ProgramAndPrService} from '../../../../services/program-and-pr.service';
import {Router} from '@angular/router';
import {Component, Input, OnInit} from '@angular/core';
import {AddNewPrForMode, ProgramRequestPageModeService} from '../../program-request/page-mode.service';
import {Program, ProgramType, RolesPermissionsService, User} from "../../../../generated";
import {UserUtils} from '../../../../services/user.utils';

@Component({
  selector: 'new-program-request',
  templateUrl: './new-program-request.component.html',
  styleUrls: ['./new-program-request.component.scss']
})
export class NewProgramComponent implements OnInit {

  addNewPrForMode: AddNewPrForMode;
  @Input() containerId: string;
  allPrograms: Program[];
  selectableProgramsOrPrs: Program[];
  selectedProgramOrPr: Program = null;
  initialSelectOption: string;

  constructor(
    private router: Router,
    private programRequestPageMode: ProgramRequestPageModeService,
    private programAndPrService: ProgramAndPrService,
    private userUtils: UserUtils,
    private rolesService: RolesPermissionsService
  ) {}

  async ngOnInit() {
    this.allPrograms = await this.programAndPrService.programs()
  }

  async setAddNewPrRadioMode(selection: AddNewPrForMode) {
    this.selectedProgramOrPr = null;
    this.addNewPrForMode = selection;
    switch(this.addNewPrForMode) {
      case 'Previously Funded Program':
        this.selectableProgramsOrPrs = await this.programAndPrService.programsMunisPrs(this.allPrograms, this.containerId);
        this.initialSelectOption = 'Program';
        break;
      case 'New FoS':
      case 'New Increment':
        this.selectableProgramsOrPrs = await this.programAndPrService.programsPlusPrsMinusSubprograms(this.containerId);
        this.initialSelectOption = 'Program';
        break;
      case 'New Subprogram':
        this.selectableProgramsOrPrs = await this.programAndPrService.programRequests(this.containerId);
        this.initialSelectOption = 'Program Request';
        break;
    }

    // make sure we can only add new programs in our organization
    var mgr: boolean = ('true' === (await this.rolesService.hasRole('POM_Manager').toPromise()).result );
    if (false === mgr) {
      var user: User = await this.userUtils.user().toPromise();
      this.selectableProgramsOrPrs = this.selectableProgramsOrPrs.filter(prog => (prog.organizationId === user.organizationId));
    }
  }

  async next() {
    this.programRequestPageMode.set( this.addNewPrForMode,
                                     this.containerId,
                                     this.selectedProgramOrPr,
                                     this.toProgramType(this.addNewPrForMode) );
    this.router.navigate(['/program-request']);
  }

  private toProgramType(addNewPrForMode: AddNewPrForMode) {
    if(this.addNewPrForMode == AddNewPrForMode.AN_MRDB_PROGRAM || this.addNewPrForMode == AddNewPrForMode.A_NEW_PROGRAM) return ProgramType.PROGRAM;
    if(this.addNewPrForMode == AddNewPrForMode.A_NEW_FOS) return ProgramType.FOS;
    if(this.addNewPrForMode == AddNewPrForMode.A_NEW_INCREMENT) return ProgramType.INCREMENT;
    if(this.addNewPrForMode == AddNewPrForMode.A_NEW_SUBPROGRAM) return ProgramType.GENERIC;
  }

}
