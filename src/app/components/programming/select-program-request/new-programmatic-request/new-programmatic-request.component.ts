import { ProgramsWithFullNameService, ProgramWithFullName } from './../../../../services/fetch-programs.service';
import { Router } from '@angular/router';
import { ProgrammaticRequest } from './../../../../generated/model/programmaticRequest';
import { Component, Input, OnInit } from '@angular/core';

// Other Components
import { Pom } from '../../../../generated/model/pom';
import { ProgramRequestPageModeService } from '../../program-request/page-mode/page-mode.service';

@Component({
  selector: 'new-programmatic-request',
  templateUrl: './new-programmatic-request.component.html',
  styleUrls: ['./new-programmatic-request.component.scss']
})
export class NewProgrammaticRequestComponent implements OnInit {

  radio: string;
  @Input() pom: Pom;
  programs: ProgramWithFullName[];
  selectedProgram: ProgramWithFullName;

  constructor(
    private router: Router,
    private programRequestPageMode: ProgramRequestPageModeService,
    private programsWithFullNameService: ProgramsWithFullNameService
  ) {}

  async ngOnInit() {
    this.programs = await this.programsWithFullNameService.programs()
    this.selectedProgram = this.programs[0];
  }

  async next() {
    switch(this.radio) {
      case 'ProgramOfRecord':
        this.programRequestPageMode.setProgramOfRecord(this.pom.id);
        this.programRequestPageMode.originatingProgramId = this.selectedProgram.id;
        break;
      case 'NewSubprogram':
        this.programRequestPageMode.setNewSubprogram(this.pom.id);
        this.programRequestPageMode.parentId = this.selectedProgram.id;
        break;
      case 'NewProgram':
        this.programRequestPageMode.setNewProgram(this.pom.id);
    }
    this.router.navigate(['/program-request']);
  }
  
}
