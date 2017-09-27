import { Component, OnInit } from '@angular/core';
import { Program, ProgramApi } from '../../generated';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.css']
})

export class ProgramsComponent implements OnInit {
  public program: Program[] = [];
  public singleProgram: Program;

  constructor(public programApi:ProgramApi) {

  }

  ngOnInit() {
    this.programApi.findAll().subscribe(c => this.program = c);
  }

  getOneProgram(id){
    this.programApi.find(id).subscribe(c => this.singleProgram = c);
  }

}
