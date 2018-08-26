import { ProgramRequestPageModeService } from './../../../programming/program-request/page-mode.service';
import { ProgramType } from './../../../../generated/model/programType';
import { CreationTimeType } from './../../../../generated/model/creationTimeType';
import { ProgramWithFullName, ProgramRequestWithFullName, WithFullNameService } from './../../../../services/with-full-name.service';
import { join } from '../../../../utils/join';
import { UserUtils } from './../../../../services/user.utils.service';
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UFRsService, POMService, ProgramsService, Program, UFR, Pom, User } from '../../../../generated';
import { ProgramTreeUtils } from '../../../../utils/program-tree-utils'

enum CreateNewUfrMode {
  FOR_A_PROGRAM_OF_RECORD        = 'For a Program of Record',
  FOR_A_NEW_PROGRAMMATIC_REQUEST = 'For a Programmatic Request',
  FOR_A_NEW_INCREMENT            = 'For a new Increment',
  FOR_A_NEW_FOS                  = 'For a new FoS',
  FOR_A_NEW_PROGRAM              = 'For a new Program'
}

@Component({
  selector: 'new-ufr',
  templateUrl: './new-ufr.component.html',
  styleUrls: ['./new-ufr.component.scss']
})
export class NewUfrComponent implements OnInit {

  createNewUfrMode: CreateNewUfrMode;
  @Input() pomId: string;
  allPrograms: ProgramWithFullName[];
  selectableProgramsOrPrs: ProgramWithFullName[];
  selectedProgramOrPr: ProgramWithFullName = null;
  initialSelectOption: string;

  constructor(
    private router: Router,
    private programRequestPageMode: ProgramRequestPageModeService,
    private withFullNameService: WithFullNameService
  ) {}

  async ngOnInit() {
    this.allPrograms = await this.withFullNameService.programs()
  }

  async setCreateNewUfrMode(createNewUfrMode: CreateNewUfrMode) {
    this.createNewUfrMode = createNewUfrMode;
    switch(this.createNewUfrMode) { 
      case 'For a Program of Record':
        this.selectableProgramsOrPrs = await this.programsMunisPrs();
        this.initialSelectOption = 'Program';
        break;
      case 'For a Programmatic Request': // was subprogram
        this.selectableProgramsOrPrs = await this.withFullNameService.programRequestsWithFullNamesDerivedFromCreationTimeData(this.pomId);
        this.initialSelectOption = 'Program Request';
        break;
      case 'For a new FoS':
      case 'For a new Increment':
        this.selectableProgramsOrPrs = await this.withFullNameService.programsPlusPrs(this.pomId);
        this.initialSelectOption = 'Program';
        break;
    }
  }

  async next() {
    switch(this.createNewUfrMode) {
      case 'For a Program of Record':
        this.programRequestPageMode.set(CreationTimeType.PROGRAM_OF_MRDB,
          this.pomId,
          this.selectedProgramOrPr,
          ProgramType.PROGRAM);
        break;
      case 'For a new FoS':
        this.programRequestPageMode.programType = ProgramType.FOS;
        if(this.isProgram(this.selectedProgramOrPr)) {
          this.programRequestPageMode.set(CreationTimeType.SUBPROGRAM_OF_MRDB,
            this.pomId,
            this.selectedProgramOrPr,
            ProgramType.FOS);
        } else { // a PR has been selected
          this.programRequestPageMode.set(CreationTimeType.SUBPROGRAM_OF_PR_OR_UFR,
            this.pomId,
            this.selectedProgramOrPr,
            ProgramType.FOS);
        }
        break;
      case 'For a new Increment':
        if(this.isProgram(this.selectedProgramOrPr)) {
          this.programRequestPageMode.set(CreationTimeType.SUBPROGRAM_OF_MRDB,
            this.pomId,
            this.selectedProgramOrPr,
            ProgramType.INCREMENT);
        } else { // a PR has been selected
          this.programRequestPageMode.set(CreationTimeType.SUBPROGRAM_OF_PR_OR_UFR,
            this.pomId,
            this.selectedProgramOrPr,
            ProgramType.INCREMENT);
        }
        break;
      case 'For a Programmatic Request': // was subprogram
        this.programRequestPageMode.set(CreationTimeType.SUBPROGRAM_OF_PR_OR_UFR,
          this.pomId,
          this.selectedProgramOrPr,
          ProgramType.GENERIC);
        break;
      case 'For a new Program':
        this.programRequestPageMode.set(CreationTimeType.NEW_PROGRAM,
          this.pomId,
          null,
          ProgramType.PROGRAM);
        break;
    }
    this.router.navigate(['/program-request']);
  }

  private async programsMunisPrs(): Promise<ProgramWithFullName[]> {
    const prs: ProgramRequestWithFullName[] = await this.withFullNameService.programRequestsWithFullNamesDerivedFromCreationTimeData(this.pomId);

    const referenceIds: Set<string> = new Set();
    prs.forEach( (pr: ProgramRequestWithFullName) => referenceIds.add(pr.creationTimeReferenceId));

    return this.allPrograms.filter( (program: ProgramWithFullName) => !referenceIds.has(program.id) );
  }

  private isProgram(programOrPr): boolean {
    return (typeof programOrPr.creationTimeType) === 'undefined';
  }
}
