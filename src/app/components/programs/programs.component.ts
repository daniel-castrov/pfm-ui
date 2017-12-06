import { Component, OnInit } from '@angular/core';
import { Program, ProgramApi } from '../../generated';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.css']
})

export class ProgramsComponent implements OnInit {
  public programs: Program[] = [];
  public singleProgram: Program;

  constructor(public programApi:ProgramApi) {

  }

  ngOnInit() {
    this.getAllPrograms();
  }

  getAllPrograms() {
    this.programApi.findall().subscribe(c => this.programs = c);
  }

}
