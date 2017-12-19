import { Component, OnInit } from '@angular/core';
import { Program, ProgramService, Increment, FundLine, Fund, FundLineService } from '../../generated';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.css']
})

export class ProgramsComponent implements OnInit {
  public programs: Program[] = [];
  public fundLines:FundLine[] = [];

  constructor(
    public programApi:ProgramService,
    public fundLineApi:FundLineService
  ) {

  }

  ngOnInit() {
    this.getAllPrograms();
    this.getAllFundLines();
  }

  getAllPrograms() {
    this.programApi.findall().subscribe(c => this.programs = c);
    let s = this.programApi.findall();
     s.subscribe(c => this.programs = c);
  }

  // TODO this gets all fundLines ... not just for this program
  getAllFundLines() {
    this.fundLineApi.findall().subscribe(c => this.fundLines = c);
  }

  getFundLines(fundLineId) {
    let fundLine:FundLine;
    this.fundLineApi.find(fundLineId).subscribe(c => fundLine = c);
    this.fundLines.push(fundLine);

    console.log(fundLine);
  }

}
