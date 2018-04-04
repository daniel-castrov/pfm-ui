import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { ProgramsService, ProgramFilter, Program } from '../../../generated';

@Component({
  selector: 'program-search',
  templateUrl: './program-search.component.html',
  styleUrls: ['./program-search.component.scss']
})
export class ProgramSearchComponent implements OnInit {
  @ViewChild(HeaderComponent) header;

  private useappropriations: boolean = false;
  private useblins: boolean = false;
  private useagencies: boolean = false;
  private appropriations: string[] = [];
  private blins: string[] = [];
  private agencies: string[] = [];
  private filter: ProgramFilter = {};
  private finds: Program[] = [];

  constructor(private programs: ProgramsService, private router: Router ) { 
  }

  ngOnInit() {
    var my: ProgramSearchComponent = this;

    this.programs.getSearchBlins().subscribe(
      (data) => { 
        my.blins = data.result;
        my.blins.sort();
        if (my.blins.length > 0) {
          my.filter.blin = my.blins[0];
        }
      });
    
    this.programs.getSearchAgencies().subscribe(
      (data) => {
        my.agencies = data.result;
        my.agencies.sort();
        if (my.agencies.length > 0) {
          my.filter.agency = my.agencies[0];
        }
      });
    
    this.programs.getSearchAppropriations().subscribe(
      (data) => {
        my.appropriations = data.result;
        my.appropriations.sort();
        if (my.appropriations.length > 0) {
          my.filter.appropriation = my.appropriations[0];
        }
      });
  }

  private search() {
    var criteria: ProgramFilter = {};
    if (this.useappropriations) {
      criteria.appropriation = this.filter.appropriation;
    }

    if (this.useagencies) {
      criteria.agency = this.filter.agency;
    }

    if (this.useblins) {
      criteria.blin = this.filter.blin;
    }

    var my: ProgramSearchComponent = this;
    this.programs.search(criteria).subscribe(
      (data) => { 
        my.finds = data.result;
      });
  }
}
