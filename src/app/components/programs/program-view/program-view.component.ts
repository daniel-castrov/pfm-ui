import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ProgramsService, Program, ProgramFilter } from '../../../generated';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'program-view',
  templateUrl: './program-view.component.html',
  styleUrls: ['./program-view.component.css']
})
export class ProgramViewComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  private allprograms: Program[] = [];
  private current: Program = null;
  private startyear: number = 2013;

  private appropriations: string[] = [];
  private blins: string[] = [];
  private opagencies: string[] = [];

  constructor(private programs: ProgramsService ) {
  }

  ngOnInit() {
    this.programs.getAll().subscribe(
      (data) => {
        this.allprograms = data.result;
        this.current = this.allprograms[0];
      }
    );

    this.programs.getTagsByType("Appropriation").subscribe(
      (data) => { this.appropriations = data.result;}
    );    
    this.programs.getTagsByType("Op_Agency").subscribe(
      (data) => { this.opagencies = data.result; }
    );
    this.programs.getSearchBlins().subscribe(
      (data) => { this.blins = data.result; }
    );


    var pf: ProgramFilter = {
      agency: '6A',
      appropriation: 'O&M'
    };
    this.programs.search(pf).subscribe(
      (data) => {
        console.log(data.result);
      } );
  }
}
