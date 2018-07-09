import { ProgramRequestWithFullName } from './../../../../services/with-full-name.service';
import { Router } from '@angular/router';
import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { ProgrammaticRequest } from '../../../../generated/model/programmaticRequest';
import { Row } from './Row';
import { PRService } from '../../../../generated/api/pR.service';
import { ProgramRequestPageModeService } from '../../program-request/page-mode.service';

@Component({
  selector: 'programmatic-requests',
  templateUrl: './programmatic-requests.component.html',
  styleUrls: ['./programmatic-requests.component.scss']
})
export class ProgrammaticRequestsComponent implements OnChanges {

  @Input() private pomProgrammaticRequests: ProgramRequestWithFullName[];
  @Input() private pbProgrammaticRequests: ProgrammaticRequest[];
  @Input() private pomFy: number;
  @Input() private pbFy: number;
  private mapNameToRow = {};
  @Output() deleted: EventEmitter<any> = new EventEmitter();

  // used only during PR deletion
  private idToDelete: string;
  private nameToDelete: string;

  constructor( private prService: PRService,
               private router: Router,
               private programRequestPageMode: ProgramRequestPageModeService ) {}

  ngOnChanges() {
    if(this.pomProgrammaticRequests && this.pbProgrammaticRequests) {
      this.mapNameToRow = this.createMapNameToRow();
    };
  }

  private createMapNameToRow() {
    const result = {};
    this.pomProgrammaticRequests.forEach(pr => {
      result[pr.shortName] = new Row(pr);
    });
    this.pbProgrammaticRequests.forEach(pr => {
      if (result[pr.shortName]) {
        result[pr.shortName].addPbPr(pr);
      };
    });
    return result;
  }

  saveDeletionValues(id: string, shortName: string) {
    this.idToDelete = id;
    this.nameToDelete = shortName;
  }

  delete() {
    this.prService.remove(this.idToDelete).toPromise();
    this.deleted.emit();
  }
  
  editPR(prId: string) {
    this.programRequestPageMode.id = prId;
    this.router.navigate(['/program-request']);    
  }

}
