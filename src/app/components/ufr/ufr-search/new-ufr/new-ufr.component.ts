import { CycleUtils } from './../../../../services/cycle.utils';
import { ProgramWithFullName, WithFullNameService } from './../../../../services/with-full-name.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UFRsService, Program, ShortyType, ProgramsService, PRService, ProgrammaticRequest, User, Organization, OrganizationService } from '../../../../generated';
import { UFR } from '../../../../generated/model/uFR';
import { FundingLine } from '../../../../generated/model/fundingLine';
import { UserUtils } from '../../../../services/user.utils';


enum CreateNewUfrMode {
  AN_MRDB_PROGRAM = 'Previously Funded Program',
  A_PROGRAM_REQUEST = 'Program Request',
  A_NEW_INCREMENT = 'New Increment',
  A_NEW_FOS = 'New FoS',
  A_NEW_PROGRAM = 'New Program'
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
               private prService: PRService,
               private orgService: OrganizationService,
               private userUtils: UserUtils ) {}

  async ngOnInit() {
    this.allPrograms = await this.withFullNameService.programs();
    this.pomId = (await this.cycleUtils.currentPom().toPromise()).id;
  }

  async setCreateNewUfrMode(createNewUfrMode: CreateNewUfrMode) {
    this.createNewUfrMode = createNewUfrMode;
    switch (this.createNewUfrMode) {
      case 'Previously Funded Program':
        this.selectableProgramsOrPrs = await this.withFullNameService.programsMunisPrs(this.allPrograms, this.pomId);
        this.initialSelectOption = 'Program';
        break;
      case 'Program Request':
        const prs = await this.withFullNameService.prsMinusGenericSubprograms(this.pomId);
        this.selectableProgramsOrPrs = this.removePrsInOutstandingState(prs);
        this.initialSelectOption = 'Program Request';
        break;
      case 'New FoS':
      case 'New Increment':
        const progsOrPrs = await this.withFullNameService.programsPlusPrsMinusSubprograms(this.pomId);
        this.selectableProgramsOrPrs = this.removePrsInOutstandingState(progsOrPrs);
        this.initialSelectOption = 'Program';
        break;
    }
  }

  removePrsInOutstandingState(progsOrPrs?: any[]) {
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
        fl.ctc = 0;
        Object.keys(fl.funds).forEach(year => {
          fl.funds[year] = 0;
        })
      });
      return emptyFundingLines;
    }
  }

  async next() {
    let ufr: UFR = { phaseId: this.pomId };
    switch (this.createNewUfrMode) {
      case 'Previously Funded Program':
        ufr.shortyType = ShortyType.MRDB_PROGRAM;
        ufr.shortyId = this.selectedProgramOrPr.id;
        ufr.fundingLines = this.generateEmptyFundingLine(this.selectedProgramOrPr.fundingLines);
        await this.initFromShortyProgram(ufr, true);
        break;
      case 'Program Request':
        ufr.shortyType = ShortyType.PR;
        ufr.shortyId = this.selectedProgramOrPr.id;
        ufr.fundingLines = this.generateEmptyFundingLine(this.selectedProgramOrPr.fundingLines);
        await this.initFromShortyPR(ufr, true);
        break;
      case 'New FoS':
        ufr.fundingLines=[];
        if (this.withFullNameService.isProgram(this.selectedProgramOrPr)) {
          ufr.shortyType = ShortyType.NEW_FOS_FOR_MRDB_PROGRAM;
          ufr.shortyId = this.selectedProgramOrPr.id;
          await this.initFromShortyProgram(ufr, false);
        } else { // a PR has been selected
          ufr.shortyType = ShortyType.NEW_FOS_FOR_PR;
          ufr.shortyId = this.selectedProgramOrPr.id;
          await this.initFromShortyPR(ufr, false);
        }
        break;
      case 'New Increment':
        ufr.fundingLines=[];
        if (this.withFullNameService.isProgram(this.selectedProgramOrPr)) {
          ufr.shortyType = ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM;
          ufr.shortyId = this.selectedProgramOrPr.id;
          await this.initFromShortyProgram(ufr, false);
        } else { // a PR has been selected
          ufr.shortyType = ShortyType.NEW_INCREMENT_FOR_PR;
          ufr.shortyId = this.selectedProgramOrPr.id;
          await this.initFromShortyPR(ufr, false);
        }
        break;
      case 'New Program':
        ufr.shortyType = ShortyType.NEW_PROGRAM;
        ufr.fundingLines=[];
        ufr.emphases=[];
        break;
    }

    if (!ufr.leadComponent) {
      var user: User = (await this.userUtils.user().toPromise());
      var organization: Organization = (await this.orgService.getById(user.organizationId).toPromise()).result;
      ufr.leadComponent = organization.abbreviation;
    }

    sessionStorage.setItem('ufr', JSON.stringify(ufr));
    this.router.navigate(['/ufr-view/create/']);
  }

  private async initFromShortyProgram(ufr: UFR, includeNames: boolean) {
    const shorty = (await this.programsService.getProgramById(ufr.shortyId).toPromise()).result as Program;
    this.initFromShorty(ufr, shorty, includeNames);
  }

  private async initFromShortyPR(ufr: UFR, includeNames: boolean) {
    const shorty = (await this.prService.getById(ufr.shortyId).toPromise()).result as ProgrammaticRequest;
    this.initFromShorty(ufr, shorty, includeNames);
  }

  private initFromShorty(ufr: UFR, shorty: Program | ProgrammaticRequest, includeNames: boolean) {
    if(includeNames) {
      ufr.shortName = shorty.shortName;
      ufr.longName = shorty.longName;
    }

    ufr.description = shorty.description;

    ufr.primaryCapability = shorty.primaryCapability;
    ufr.coreCapability = shorty.coreCapability;
    ufr.secondaryCapability = shorty.secondaryCapability;

    ufr.functionalArea = shorty.functionalArea;
    ufr.medicalArea = shorty.medicalArea;
    ufr.nbcCategory = shorty.nbcCategory;

    ufr.bsvStrategy = shorty.bsvStrategy;
    ufr.organizationId = shorty.organizationId;
    ufr.manager = shorty.manager;

    ufr.emphases = [...shorty.emphases];

    // For a UFR variants always start empty
    ufr.fundingLines.forEach( fl => fl.variants=[] );
  }

}
