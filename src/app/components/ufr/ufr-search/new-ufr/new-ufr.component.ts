import { CycleUtils } from './../../../../services/cycle.utils';
import { ProgramWithFullName, WithFullNameService } from './../../../../services/with-full-name.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {UFRsService, Program, UFR, ShortyType, FundingLine, ProgramsService, PRService} from '../../../../generated';

enum CreateNewUfrMode {
  AN_MRDB_PROGRAM = 'An MRDB Program',
  A_PROGRAMMATIC_REQUEST = 'A Programmatic Request',
  A_NEW_INCREMENT = 'A New Increment',
  A_NEW_FOS = 'A New FoS',
  A_NEW_PROGRAM = 'A New Program'
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

  constructor( private router: Router,
               private withFullNameService: WithFullNameService,
               private ufrService: UFRsService,
               private cycleUtils: CycleUtils,
               private programsService: ProgramsService,
               private prService: PRService ) {}

  async ngOnInit() {
    this.allPrograms = await this.withFullNameService.programs();
    this.pomId = (await this.cycleUtils.currentPom().toPromise()).id;
  }

  async setCreateNewUfrMode(createNewUfrMode: CreateNewUfrMode) {
    this.createNewUfrMode = createNewUfrMode;
    switch (this.createNewUfrMode) {
      case 'An MRDB Program':
        this.selectableProgramsOrPrs = await this.withFullNameService.programsMunisPrs(this.allPrograms, this.pomId);
        this.initialSelectOption = 'Program';
        break;
      case 'A Programmatic Request': // was subprogram
        let prs:any = await this.withFullNameService.programRequestsWithFullNamesDerivedFromCreationTimeData(this.pomId);
        this.selectableProgramsOrPrs = this.removeOnlyPrsInOutandingState(prs);
        this.initialSelectOption = 'Program Request';
        break;
      case 'A New FoS':
      case 'A New Increment':
        let progsOrPrs:any = await this.withFullNameService.programPlusPrsMinusPrsForGenericSubprograms(this.pomId);
        this.selectableProgramsOrPrs = this.removeOnlyPrsInOutandingState(progsOrPrs);
        this.initialSelectOption = 'Program';
        break;
    }
  }

  removeOnlyPrsInOutandingState(progsOrPrs?: any[]) {
    let newPRs:any[] = [];
    progsOrPrs.forEach((item, index) => {
      // programs don't have a state 
      if ( !item.state ) {
        newPRs.push(item);
      }
      // prs in OUTSTNADING are not valid for creating a UFR 
      else if ( item.state != "OUTSTANDING" ) {
        newPRs.push(item);
      }
    });
    return newPRs;
  }

  generateEmptyFundingLine(fundingLines: FundingLine[]): FundingLine[] {
    if (fundingLines) {
      let emptyFundingLines = JSON.parse(JSON.stringify(fundingLines));
      emptyFundingLines.forEach(fl => {
        Object.keys(fl.funds).forEach(year => {
          fl.funds[year] = 0;
        })
      });
      return emptyFundingLines;
    }
  }

  async next() {
    let ufr: UFR = { phaseId: this.pomId };
    if (this.selectedProgramOrPr) {
      ufr.fundingLines = this.generateEmptyFundingLine(this.selectedProgramOrPr.fundingLines);
    }
    switch (this.createNewUfrMode) {
      case 'An MRDB Program':
        ufr.shortyType = ShortyType.MRDB_PROGRAM;
        ufr.shortyId = this.selectedProgramOrPr.id;
        this.initFromShortyProgram(ufr);
        break;
      case 'A Programmatic Request':
        ufr.shortyType = ShortyType.PR;
        ufr.shortyId = this.selectedProgramOrPr.id;
        this.initFromShortyPR(ufr);
        break;
      case 'A New FoS':
        if (this.withFullNameService.isProgram(this.selectedProgramOrPr)) {
          ufr.shortyType = ShortyType.NEW_FOS_FOR_MRDB_PROGRAM;
          ufr.shortyId = this.selectedProgramOrPr.id;
          this.initFromShortyProgram(ufr);
        } else { // a PR has been selected
          ufr.shortyType = ShortyType.NEW_FOS_FOR_PR;
          ufr.shortyId = this.selectedProgramOrPr.id;
          this.initFromShortyPR(ufr);
        }
        break;
      case 'A New Increment':
        if (this.withFullNameService.isProgram(this.selectedProgramOrPr)) {
          ufr.shortyType = ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM;
          ufr.shortyId = this.selectedProgramOrPr.id;
          this.initFromShortyProgram(ufr);
        } else { // a PR has been selected
          ufr.shortyType = ShortyType.NEW_INCREMENT_FOR_PR;
          ufr.shortyId = this.selectedProgramOrPr.id;
          this.initFromShortyPR(ufr);
        }
        break;
      case 'A New Program':
        ufr.shortyType = ShortyType.NEW_PROGRAM;
        break;
    }
    ufr = (await this.ufrService.create(ufr).toPromise()).result;
    this.router.navigate(['/ufr-view', ufr.id]);
  }

  private async initFromShortyProgram(ufr: UFR) {
    const shorty = (await this.programsService.getProgramById(ufr.shortyId).toPromise()).result;
    this.initFromShorty(ufr, shorty);
  }

  private async initFromShortyPR(ufr: UFR) {
    const shorty = (await this.prService.getById(ufr.shortyId).toPromise()).result;
    this.initFromShorty(ufr, shorty);
  }

  private initFromShorty(ufr: UFR, shorty) {
    ufr.primaryCapability = shorty.primaryCapability;
    ufr.coreCapability = shorty.coreCapability;
    ufr.secondaryCapability = shorty.secondaryCapability;

    ufr.functionalArea = shorty.functionalArea;
    ufr.medicalArea = shorty.medicalArea;
    ufr.nbcCategory = shorty.nbcCategory;

    ufr.bsvStrategy = shorty.bsvStrategy;
    ufr.organization = shorty.organization;
    ufr.manager = shorty.manager;
  }

}
