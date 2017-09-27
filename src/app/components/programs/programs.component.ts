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
    this.getOneProgram(1);
  }

  getAllPrograms() {
    this.programApi.findAll().subscribe(c => this.programs = c);
  }

  getOneProgram(id){
    this.programApi.find(id).subscribe(c => this.singleProgram = c);
  }

}
