import { CreationTimeType } from './../../../../generated/model/creationTimeType';
import { WithFullNameService, ProgramWithFullName, ProgramRequestWithFullName } from '../../../../services/with-full-name.service';
import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import {ProgramRequestPageModeService} from '../../program-request/page-mode.service';
import {ProgramType} from "../../../../generated";

enum AddNewPrForMode {
  AN_MRDB_PROGRAM = 'An MRDB Program',
  A_NEW_INCREMENT = 'A New Increment',
  A_NEW_FOS = 'A New FoS',
  A_NEW_SUBPROGRAM = 'A New Subprogram',
  A_NEW_PROGRAM = 'A New Program'
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
    private withFullNameService: WithFullNameService
  ) {}

  async ngOnInit() {
    this.allPrograms = await this.withFullNameService.programs()
  }

  async setAddNewPrRadioMode(selection: AddNewPrForMode) {
    this.addNewPrForMode = selection;
    switch(this.addNewPrForMode) {
      case 'An MRDB Program':
        this.selectableProgramsOrPrs = await this.programsMunisPrs();
        this.initialSelectOption = 'Program';
        break;
      case 'A New FoS':
      case 'A New Increment':
        this.selectableProgramsOrPrs = await this.withFullNameService.programPlusPrsMinusPrsForGenericSubprograms(this.pomId);
        this.initialSelectOption = 'Program';
        break;
      case 'A New Subprogram':
        this.selectableProgramsOrPrs = await this.withFullNameService.programRequestsWithFullNamesDerivedFromCreationTimeData(this.pomId);
        this.initialSelectOption = 'Program Request';
        break;
    }
  }

  async next() {
    switch(this.addNewPrForMode) {
      case 'An MRDB Program':
        this.programRequestPageMode.set(CreationTimeType.PROGRAM_OF_MRDB,
          this.pomId,
          this.selectedProgramOrPr,
          ProgramType.PROGRAM);
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
      case 'A New Subprogram':
        this.programRequestPageMode.set(CreationTimeType.SUBPROGRAM_OF_PR_OR_UFR,
          this.pomId,
          this.selectedProgramOrPr,
          ProgramType.GENERIC);
        break;
      case 'A New Program':
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
