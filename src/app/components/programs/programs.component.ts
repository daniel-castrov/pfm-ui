import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NgFor } from '@angular/common/src/directives/ng_for_of';

// Other Components
import { HeaderComponent } from '../../components/header/header.component';

// Generated

import { RestResult } from '../../generated/model/restResult';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.css']
})

export class ProgramsComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  


  constructor(
   
  ) {

  }

  ngOnInit() {

    
  }

  getAllPrograms() {

   
  }

  // TODO this gets all fundLines ... not just for this program
  getAllFundLines() {
    
  }

  getFundLine(id) {

  }

  // TODO This does not work because this.programResult is undefined
  processSomething(){
  }


}
