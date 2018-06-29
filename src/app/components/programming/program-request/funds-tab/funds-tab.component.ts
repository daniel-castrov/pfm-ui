import { AutoValuesService } from './AutoValues.service';
import { FeedbackComponent } from './../../../feedback/feedback.component';
import { User } from './../../../../generated/model/user';
import { GlobalsService } from './../../../../services/globals.service';
import { PB } from './../../../../generated/model/pB';
import { ProgramViewComponent } from './../../../programs/program-view/program-view.component';
import { Component, Input, ApplicationRef, OnChanges, ViewChild, OnInit } from '@angular/core'
import { forkJoin } from "rxjs/observable/forkJoin"
import { Program, FundingLine, IntMap, UFR, POMService, Pom, PRService, PBService, ProgrammaticRequest, Tag, ProgramsService } from '../../../../generated'
import { Row } from './Row';
import { Key } from './Key';

@Component({
  selector: 'funds-tab',
  templateUrl: './funds-tab.component.html',
  styleUrls: ['./funds-tab.component.scss']
})
export class FundsTabComponent implements OnChanges, OnInit {
  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;
  @Input() pr: ProgrammaticRequest;
  private pomFy: number;
  private pbFy: number;
  // key is appropriation+blin
  private rows: Map<string, Row> = new Map<string, Row>();
  
  // for the add FL section
  private appropriations: string[] = [];
  private appropriation: string;
  private baOrBlins: string[] = [];
  private baOrBlin: string;
  private item: string;
  private opAgencies: string[] = [];
  private opAgency: string;
  private programElement: string;
  private acquisitionTypes: string[];
  private acquisitionType: string;

  constructor(private pomService: POMService,
              private pbService: PBService,
              private prService: PRService,
              private globalsService: GlobalsService,
              private autoValuesService: AutoValuesService ) {}

  async ngOnInit() {
    await this.loadDropdownOptions();
  }
  
  ngOnChanges() {
    if(!this.pr.phaseId) return; // the parent has not completed it's ngOnInit()
    this.initRows();
  }
  
  private initRows() {
    this.setPomFiscalYear();
    this.setPOMtoRows();
    this.setPBtoRows();
  }
  
  private async setPomFiscalYear() {
    const pom: Pom = (await this.pomService.getById(this.pr.phaseId).toPromise()).result;
    this.pomFy = pom.fy;
  }
  
  private async loadDropdownOptions() {
    {
      this.opAgencies = await this.globalsService.tagAbbreviationsForOpAgency();
      this.opAgency = this.opAgencies[0];
    }
    {
      this.appropriations = await this.globalsService.tagAbbreviationsForAppropriation();
      this.appropriation = this.appropriations[0];
      this.onAppropriationChange();
    }
    {
      this.baOrBlins = await this.globalsService.tagAbbreviationsForBlin();
      this.baOrBlin = this.getInitiallySelectedBlins()[0];
      this.onBaOrBlinChange();
    }
    {
      this.acquisitionTypes = await this.globalsService.tagAbbreviationsForAcquisitionType();
      this.acquisitionType = this.acquisitionTypes[0];
    }
  }

  onAppropriationChange() {
    this.updateBaOrBlins();
  }

  onBaOrBlinChange() {
    this.updateProgramElement();
    this.updateItem();
  }

  onItemChange() {
    this.updateProgramElement();
  }
  
  async updateBaOrBlins() {
    this.baOrBlins = await this.autoValuesService.baOrBlins(this.appropriation);
    this.onBaOrBlinChange()
  }
  
  async updateProgramElement() {
    this.programElement = await this.autoValuesService.programElement(this.baOrBlin, this.item);
  }
  
  updateItem() {
    this.item = this.autoValuesService.item(this.pr.functionalArea, this.baOrBlin);
  }
  
  private setPOMtoRows() {
    this.rows.clear();
    this.pr.fundingLines.forEach(fundingLine => {
      var key = Key.create(fundingLine.appropriation, fundingLine.baOrBlin, fundingLine.item, fundingLine.opAgency);
      this.rows.set(key, new Row( fundingLine.appropriation,
                                  fundingLine.baOrBlin,
                                  fundingLine.item,
                                  fundingLine.opAgency,
                                  new Map<number, number>(),
                                  fundingLine ) );
    });
  }

  private async setPBtoRows() {
    const user: User = await this.globalsService.user().toPromise();
    const pb: PB = (await this.pbService.getLatest(user.currentCommunityId).toPromise()).result;
    this.pbFy = pb.fy;

    // there is no PB if there is no this.pr.originalMrId
    if(!this.pr.originalMrId) return;

    const pbPr: ProgrammaticRequest = (await this.prService.getByPhaseAndMrId(pb.id, this.pr.originalMrId).toPromise()).result;

    pbPr.fundingLines.forEach(pbFundingLine => {
      const key = Key.create(pbFundingLine.appropriation, pbFundingLine.baOrBlin, pbFundingLine.item, pbFundingLine.opAgency);
      if (this.rows.has(key)) {
        var row: Row = this.rows.get(key);
        Object.keys(pbFundingLine.funds).forEach( yearstr => {
          row.pbFunds.set(+yearstr, pbFundingLine.funds[yearstr]);
          row.calculateTotalForYear(+yearstr);
        });
      };
    });
  }

  addFundingLine() {
    const key: string = Key.create(this.appropriation, this.baOrBlin, this.item, this.opAgency);
    if (this.rows.has(key)) {
      this.feedback.failure('Funding Line already exists');
    } else {
      // now set this same data in the current data (for saves)
      var fundingLine: FundingLine = {
        fy: this.pomFy,
        appropriation: this.appropriation,
        baOrBlin: this.baOrBlin,
        item: this.item,
        opAgency: this.opAgency,
        programElement: this.programElement,
        funds: {},
        variants: []
      };
      this.pr.fundingLines.push(fundingLine);
      this.initRows();
    }
  }

  onEdit(value: string, row: Row, year: number) {
    row.fundingLine.funds[year] = +value;
    row.calculateTotalForYear(year);
  }

  // wierd algorithm for initial BLINs selection based on the initial this.appropriation selection. Possibly flawn.
  getInitiallySelectedBlins(): string[] {
    if ('PROC' === this.appropriation) return this.baOrBlins.filter(baOrBlin => (baOrBlin.match(/00/)));
    else if ('RDTE' === this.appropriation) return this.baOrBlins.filter(baOrBlin => (baOrBlin.match(/BA[1-4]/)));
    else if ('O&M' === this.appropriation) return this.baOrBlins.filter(baOrBlin => (baOrBlin.match(/BA[5-7]/)));
    else return this.baOrBlins;
  }

  totals(year: number, mode: string) {
    var sum: number = 0;
    this.rows.forEach(row => {
           if ('PB'    === mode) sum += row.pbFunds.get(year)       || 0;
      else if ('POM'   === mode) sum += row.fundingLine.funds[year] || 0;
      else if ('TOTAL' === mode) sum += row.deltaFunds.get(year)    || 0;
    });
    return sum;
  }

}

