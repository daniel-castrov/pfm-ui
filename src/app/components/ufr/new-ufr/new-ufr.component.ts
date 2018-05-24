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
  private programs: ProgramWrapper[] = [];
  private selected: Program;

  constructor(private usvc: UFRsService, private pomsvc:POMService, private psvc:ProgramsService ) { }

  ngOnInit() {
    var my: NewUfrComponent = this;
    this.psvc.getAll().subscribe(data => { 
      console.log(data.result);

      var idproglkp: Map<string, Program> = new Map<string, Program>();
      data.result.forEach((p:Program) => { 
        idproglkp.set(p.id, p);
      });

      function progFullName(p: Program): string{
        var pname = '';
        if (null != p.parentId){
          pname = progFullName(idproglkp.get(p.parentId)) + '::';
        }
        return pname + p.shortName;
      }

      data.result.forEach((p: Program) => {
        my.programs.push({ program: p, fullname: progFullName(p) });
      });
      
      my.programs.sort(function (a, b) {
        if (a.fullname === b.fullname) {
          return 0;
        }
        return (a.fullname < b.fullname ? -1 : 1);
      });

      console.log(my.programs);
      my.selected = my.programs[0].program;
    });
  }

  showPrograms(yes, title) {
    console.log(this.selected);

    this.needProgramSelector = yes;
    this.programSelectorTitle = title;
  }
}

interface ProgramWrapper {
  program: Program,
  fullname: string
}
