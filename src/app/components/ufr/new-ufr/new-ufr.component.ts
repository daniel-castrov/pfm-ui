import { Component, OnInit } from '@angular/core';
import { UFRsService, POMService, ProgramsService, Program } from '../../../generated';

@Component({
  selector: 'app-new-ufr',
  templateUrl: './new-ufr.component.html',
  styleUrls: ['./new-ufr.component.scss']
})
export class NewUfrComponent implements OnInit {
  private needProgramSelector:boolean = false;
  private programSelectorTitle: string = '';
  private programs: Program[] = [];
  private selected: Program;

  constructor(private usvc: UFRsService, private pomsvc:POMService, private psvc:ProgramsService ) { }

  ngOnInit() {
    var my: NewUfrComponent = this;
    this.psvc.getAll().subscribe(data => { 
      my.programs = data.result;
      my.selected = my.programs[0];
    });


  }

  showPrograms(yes, title) {
    this.needProgramSelector = yes;
    this.programSelectorTitle = title;
  }
}
