import { Component, OnInit, } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from "rxjs/observable/forkJoin";

import { UFRsService, POMService, ProgramsService, Program, UFR, MyDetailsService, Community, Pom } from '../../../generated';

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

        var idproglkp: Map<string, Program> = new Map<string, Program>();
        data[1].result.forEach((p: Program) => {
          idproglkp.set(p.id, p);
        });

        function progFullName(p: Program): string {
          var pname = '';
          if (null != p.parentId) {
            pname = progFullName(idproglkp.get(p.parentId)) + '::';
          }
          return pname + p.shortName;
        }

        data[1].result.forEach((p: Program) => {
          my.programs.push({ program: p, fullname: progFullName(p) });
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
    var ufr: UFR = {
      pomId: this.pom.id,
      organization: this.selected.organization
    };

    if ('FL' === this.mode || 'SP' === this.mode ) {
      this.usvc.addFundingLine(this.pom.id, this.selected.shortName).subscribe(data => {
        var ufrid = data.result;
        my.router.navigate(['/ufr-view', ufrid]);
      });
    }
    else {
      ufr.name = 'New Program POM ' + my.pom.fy;
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
