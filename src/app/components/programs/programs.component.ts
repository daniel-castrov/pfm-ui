import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.css']
})

export class ProgramsComponent {
  program:any[];
  
  constructor(public dataService:DataService)
  {
      this.dataService.getProgram().subscribe(program => {
          console.log(program);
          this.program = program;
      });
  }
}
