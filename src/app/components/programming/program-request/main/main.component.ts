import { ProgrammaticRequest } from './../../../../generated/model/programmaticRequest';
import { PRService } from './../../../../generated/api/pR.service';
import { Component, OnInit, ViewChild, Input } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../../components/header/header.component';
import { ProgramRequestPageModeService } from '../page-mode/page-mode.service';


@Component({
  selector: 'program-request',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class ProgramRequestComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  private pr: ProgrammaticRequest = {};

  constructor(
    private prService: PRService,
    private programRequestPageMode: ProgramRequestPageModeService ) {}

  async ngOnInit() {
    if(this.programRequestPageMode.id) {
      this.pr = (await this.prService.getById(this.programRequestPageMode.id).toPromise()).result;
    }
  }

  async save() {
    if(this.pr.id) {
      this.pr = (await this.prService.save(this.pr.id, this.pr).toPromise()).result;
    } else {
      this.pr.phaseId = this.programRequestPageMode.phaseId;
      this.pr = (await this.prService.create(this.pr).toPromise()).result;
    }
  }
}
