import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NgFor } from '@angular/common/src/directives/ng_for_of';

// Other Components
import { HeaderComponent } from '../../components/header/header.component';

// Generated
import { ProgramService } from '../../generated/api/program.service';
import { FundLineService } from '../../generated/api/fundLine.service';
import { Program } from '../../generated/model/program'
import { Increment } from '../../generated/model/increment'
import { FundLine } from '../../generated/model/fundLine'
import { RestResult } from '../../generated/model/restResult';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.css']
})

export class ProgramsComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  public programs: Program[] = [];
  public fundLines:FundLine[] = [];

  public programResult: RestResult;
  public fundLineResult: RestResult;

  constructor(
    public programApi:ProgramService,
    public fundLineApi:FundLineService
  ) {

  }

  ngOnInit() {

    let fundLineResult:RestResult;
    fundLineResult = new Object();
    fundLineResult.error=null;
    fundLineResult.result=[];
    this.fundLineResult = fundLineResult;

    this.getAllPrograms();
    //this.getAllFundLines();
  }

  getAllPrograms() {

    let my = this;
    var result1;

    my.programApi.findall().subscribe((c) => {
      result1 = c;
      my.programResult=result1;

      let prog:Program;
      for ( prog of result1.result ){

        let inc:Increment;
        for ( inc of prog.increments ){

          for ( let num of inc.fundingLineIds ){
            var result2;
            my.fundLineApi.find(num).subscribe( (c) =>
              { result2 = c;
                my.fundLineResult.result.push(result2.result);
              }
            );
          }

        }

      }
      my.processSomething();
    });
  }

  // TODO this gets all fundLines ... not just for this program
  getAllFundLines() {
    this.fundLineApi.findall().subscribe(c => this.fundLineResult = c);
  }

  getFundLine(id) {
    let x:RestResult;
    this.fundLineApi.find(id).subscribe(c => x = c);
  }

  // TODO This does not work because this.programResult is undefined
  processSomething(){
    this.programs = this.programResult.result;
    for ( let program of this.programs ){
      console.log( program.programName );
    }
  }


}
