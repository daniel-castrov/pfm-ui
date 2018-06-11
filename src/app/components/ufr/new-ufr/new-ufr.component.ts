import { Component, OnInit, } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from "rxjs/observable/forkJoin";

import { UFRsService, POMService, ProgramsService, Program, UFR, MyDetailsService, Community, Pom } from '../../../generated';
import { ProgramTreeUtils } from '../../../utils/program-tree-utils'

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
  private mode: string;
  private pom: Pom;

  constructor(private usvc: UFRsService, private pomsvc: POMService, private psvc: ProgramsService,
  private router:Router, private deetsvc:MyDetailsService ) { }

  ngOnInit() {
    var my: NewUfrComponent = this;

    my.deetsvc.getCurrentUser().subscribe((person) => {
      forkJoin([
        my.pomsvc.getOpen(person.result.currentCommunityId),
        my.psvc.getAll()
      ]).subscribe(data => {
        my.pom = data[0].result;

        ProgramTreeUtils.fullnames(data[1].result).forEach((fullname, program) => { 
          my.programs.push({ program: program, fullname: fullname });
        });

        my.programs.sort(function (a, b) {
          if (a.fullname === b.fullname) {
            return 0;
          }
          return (a.fullname < b.fullname ? -1 : 1);
        });

        //console.log(my.programs);
        my.selected = my.programs[0].program;
      });
    });
  }

  setMode(mode) {
    if ('FL' === mode) { // funding lines only
      this.needProgramSelector = true;
      this.programSelectorTitle = 'Select Program ID';
    }
    else if ('SP' === mode) { // subprogram
      this.needProgramSelector = true;
      this.programSelectorTitle = 'Select Parent Program ID';
    }
    else if ('P' === mode) { // new program
      this.needProgramSelector = false;
    }
    this.mode = mode;
  }

  create() {
    var my: NewUfrComponent = this;
    console.log('create ' + this.mode + ' UFR');

    if ('FL' === this.mode ) {
      this.usvc.addFundingLine(this.pom.id, this.selected.id).subscribe(data => {
        var ufrid = data.result;
        my.router.navigate(['/ufr-view', ufrid]);
      });
    }
    else {
      var title = ('SP' === this.mode ? ' sub ' + this.selected.shortName : '');
      var ufr: UFR = {
        phaseId: this.pom.id,
        organization: this.selected.organization,
        name: 'UFR new' + title + ' POM ' + my.pom.fy
      };

      if ('SP' === this.mode) {
        ufr.parentMrId = this.selected.id;
        ufr.type = 'INCREMENT';
      }
      else {
        ufr.type = 'PROGRAM';
      }

      this.usvc.create(ufr).subscribe(data => {
        var ufrid = data.result;
        my.router.navigate(['/ufr-view', ufrid]);
      });      
    }

    this.mode = null;
  }
}

interface ProgramWrapper {
  program: Program,
  fullname: string
}
