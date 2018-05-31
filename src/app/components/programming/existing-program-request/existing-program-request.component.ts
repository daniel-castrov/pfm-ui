import { ProgrammaticRequest } from './../../../generated/model/programmaticRequest';
import { PRService } from './../../../generated/api/pR.service';
import { Component, OnInit, ViewChild, Input } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'existing-program-request',
  templateUrl: './existing-program-request.component.html',
  styleUrls: ['./existing-program-request.component.scss']
})
export class ProgramRequestComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  private pr: ProgrammaticRequest = {};

  constructor(
    private prService: PRService,
    private activatedRoute: ActivatedRoute ) {}

  async ngOnInit() {
    const prId = this.activatedRoute.snapshot.paramMap.get('prId');
    this.pr = (await this.prService.getById(prId).toPromise()).result;
  }

  save() {
    this.prService.save(this.pr.id, this.pr).subscribe();
  }
}
