import { Component, OnInit } from '@angular/core';
import { ProgramsService, Program } from '../../../generated';

@Component({
  selector: 'program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.css']
})
export class ProgramComponent implements OnInit {
  private allprograms: Program[] = [];

  constructor( private programs:ProgramsService ) { }

  ngOnInit() {
    this.programs.getall().subscribe(
      (data) => { 
        this.allprograms = data.result;
      }
    );
  }

}
