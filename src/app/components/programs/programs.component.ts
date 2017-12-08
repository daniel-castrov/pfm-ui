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

  getAllFundLines() {
    this.fundLineApi.findall().subscribe(c => this.fundLines = c);
  }


  getFundLines(fundLineId) {
    let fundLine:FundLine;
    this.fundLineApi.find(fundLineId).subscribe(c => fundLine = c);
    this.fundLines.push(fundLine);

    console.log(fundLine);
  }

  donothing(){
    for ( let program of this.programs ){
      program.id
      program.programId
      program.programName
      program.description
      for ( let pocid of  program.pocId){
        pocid
      } // array of int
      for ( let tag of  program.tags){
        tag.id
        tag.type
        tag.name
        tag.abbr
      }
      for( let inc of program.increments ){
        inc.description
        inc.incrementNumber
        for ( let tag of inc.tags){
          tag.id
          tag.type
          tag.name
          tag.abbr
        }
        for (let fundLineId of inc.fundingLineIds){
          this.getFundLines(fundLineId);
        }
        
        for ( let fundLine of this.fundLines ){
          fundLine.id
          fundLine.fiscalYear
          fundLine.description
          for ( let tag of  fundLine.tags){
            tag.id
            tag.type
            tag.name
            tag.abbr
          }
          for (let fund of fundLine.funds){
            fund.year
            fund.amount
          }
        }
      }
    }
  }

}
