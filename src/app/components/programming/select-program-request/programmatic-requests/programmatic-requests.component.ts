import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Program } from '../../../../generated/model/program';
import { ProgrammaticRequest } from '../../../../generated/model/programmaticRequest';
import { Row } from './Row';
import { PRService } from '../../../../generated/api/pR.service';

@Component({
  selector: 'programmatic-requests',
  templateUrl: './programmatic-requests.component.html',
  styleUrls: ['./programmatic-requests.component.scss']
})
export class ProgrammaticRequestsComponent implements OnChanges {

  @Input() private pomProgrammaticRequests: ProgrammaticRequest[];
  @Input() private pbProgrammaticRequests: ProgrammaticRequest[];
  @Input() private by: number;
  private rows = {};
  @Output() deleted: EventEmitter<any> = new EventEmitter();

  // used only during PR deletion
  private idToDelete: string;
  private nameToDelete: string;

  constructor( private prService: PRService ) {}

  ngOnChanges() {
    if(this.pomProgrammaticRequests && this.pbProgrammaticRequests) {
      this.rows = {};
      this.pomProgrammaticRequests.forEach( pr => {
        this.rows[pr.shortName]=new Row(pr);
      });
      this.pbProgrammaticRequests.forEach( pr => {
        if(this.rows[pr.shortName]) {
          this.rows[pr.shortName].addPbPr(pr);
        };
      });
    };
  }

  saveDeletionValues(id: string, shortName: string) {
    this.idToDelete = id;
    this.nameToDelete = shortName;
  }

  delete() {
    this.prService.remove(this.idToDelete).toPromise();
    this.deleted.emit();
  }
}
