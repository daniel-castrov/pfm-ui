import { CycleUtils } from './../../../../services/cycle.utils';
import { ProgramRequestPageModeService } from './../../../programming/program-request/page-mode.service';
import { ProgramType } from './../../../../generated/model/programType';
import { CreationTimeType } from './../../../../generated/model/creationTimeType';
import { ProgramWithFullName, ProgramRequestWithFullName, WithFullNameService } from './../../../../services/with-full-name.service';
import { join } from '../../../../utils/join';
import { UserUtils } from '../../../../services/user.utils';
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UFRsService, POMService, ProgramsService, Program, UFR, Pom, User } from '../../../../generated';
import { ProgramTreeUtils } from '../../../../utils/program-tree-utils'

enum CreateNewUfrMode {
  AN_MRDB_PROGRAM        = 'An MRDB Program',
  A_PROGRAMMATIC_REQUEST = 'A Programmatic Request',
  A_NEW_INCREMENT        = 'A New Increment',
  A_NEW_FOS              = 'A New FoS',
  A_NEW_PROGRAM          = 'A New Program'
}

@Component({
  selector: 'new-ufr',
  templateUrl: './new-ufr.component.html',
  styleUrls: ['./new-ufr.component.scss']
})
export class NewUfrComponent implements OnInit {

  createNewUfrMode: CreateNewUfrMode;
  pomId: string;
  allPrograms: ProgramWithFullName[];
  selectableProgramsOrPrs: ProgramWithFullName[];
  selectedProgramOrPr: ProgramWithFullName = null;
  initialSelectOption: string;

  constructor(
    private router: Router,
    private programRequestPageMode: ProgramRequestPageModeService,
    private withFullNameService: WithFullNameService,
    private ufrService: UFRsService,
    private cycleUtils: CycleUtils ) {}

  async ngOnInit() {
    this.allPrograms = await this.withFullNameService.programs()
    this.pomId = (await this.cycleUtils.currentPom().toPromise()).id;
  }

  async setCreateNewUfrMode(createNewUfrMode: CreateNewUfrMode) {
    this.createNewUfrMode = createNewUfrMode;
    switch(this.createNewUfrMode) { 
      case 'An MRDB Program':
        this.selectableProgramsOrPrs = await this.programsMunisPrs();
        this.initialSelectOption = 'Program';
        break;
      case 'A Programmatic Request': // was subprogram
        this.selectableProgramsOrPrs = await this.withFullNameService.programRequestsWithFullNamesDerivedFromCreationTimeData(this.pomId);
        this.initialSelectOption = 'Program Request';
        break;
      case 'A New FoS':
      case 'A New Increment':
        this.selectableProgramsOrPrs = await this.withFullNameService.programsPlusPrs(this.pomId);
        this.initialSelectOption = 'Program';
        break;
    }
  }

  async next() {
    let ufr: UFR = {phaseId: this.pomId};
    switch(this.createNewUfrMode) {
      case 'An MRDB Program':
        ufr.originalMrId = this.selectedProgramOrPr.id;
        ufr.creationTimeType = CreationTimeType.PROGRAM_OF_MRDB;
        ufr.creationTimeReferenceId = this.selectedProgramOrPr.id;
        ufr.type = ProgramType.PROGRAM;
        ufr.longName = this.selectedProgramOrPr.longName;
        break;
      case 'A Programmatic Request': // was subprogram
        ufr.creationTimeType = CreationTimeType.SUBPROGRAM_OF_PR_OR_UFR;
        ufr.creationTimeReferenceId = this.selectedProgramOrPr.id;
        ufr.type = ProgramType.GENERIC; // is this right? I guess GENERIC for a UFR means 'For a PR'. Reusing the value with PRs for a completely different purpose
        ufr.longName = this.selectedProgramOrPr.longName;
        break;
      case 'A New FoS':
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
      case 'A New Increment':
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
      case 'A New Program':
        ufr.creationTimeType = CreationTimeType.PROGRAM_OF_MRDB;
        ufr.type = ProgramType.PROGRAM;
      break;
    }
    ufr = (await this.ufrService.update(ufr).toPromise()).result;
    this.router.navigate(['/ufr-view', ufr.id]);
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
