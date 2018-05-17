import { Component, OnInit, Input } from '@angular/core';
import { Program, FundingLine, IntMap, UFR, POMService, Pom } from '../../../generated';

@Component({
  selector: 'ufr-funds',
  templateUrl: './ufr-funds.component.html',
  styleUrls: ['./ufr-funds.component.scss']
})
export class UfrFundsComponent implements OnInit {
  @Input() current: UFR;
  private pom: Pom;
    
  constructor( private pomsvc:POMService) { }

  ngOnInit() {
    // FIXME: we need to fetch the given programmatic request from the pom
    // we can find it based on originalProgramId of the UFR

    var my: UfrFundsComponent = this;
    this.pomsvc.getById(this.current.phaseId).subscribe(data => { 
      my.pom = data.result;
    });

    console.log(this.current);
  }

}
