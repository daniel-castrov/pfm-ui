import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core'
import {Pom, POMService, ShortyType, UFR, UFRsService} from '../../../../generated'
import {WithFullName, WithFullNameService} from "../../../../services/with-full-name.service";
import {ActivatedRoute} from "@angular/router";
import {HeaderComponent} from "../../../header/header.component";

@Component({
  selector: 'ufr-approval-detail',
  templateUrl: './ufr-approval-detail.component.html',
  styleUrls: ['./ufr-approval-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UfrApprovalDetailComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  ufr: UFR;
  shorty: WithFullName;
  pom: Pom;
  requestNumber: string;
  statusSelected: string = null;
  prioritySelected: number = null;
  dispositionSelected: string = null;
  nextUfrId;
  previousUfrId;

  constructor(private withFullNameService: WithFullNameService,
              private pomService: POMService,
              private route: ActivatedRoute,
              private ufrService: UFRsService) {}

  ngOnInit() {
    this.route.params
      .subscribe(params => {
        let ufrId = params['id'];
        this.nextUfrId = null;
        this.previousUfrId = null;
        this.ufrService.getUfrById(ufrId).subscribe(ufrResponse => {
          this.ufr = ufrResponse.result;
          this.ufrService.getNext(this.ufr.requestNumber).subscribe(ufrNextResponse => {
            if(ufrNextResponse.result !== null) {
              this.nextUfrId = ufrNextResponse.result.id;
            }
          });
          this.ufrService.getPrevious(this.ufr.requestNumber).subscribe(ufrPreviousResponse => {
            if(ufrPreviousResponse.result !== null) {
              this.previousUfrId = ufrPreviousResponse.result.id;
            }
          });
          this.initShorty();
          this.pomService.getById(this.ufr.phaseId).subscribe(pomResponse => {
            this.pom = pomResponse.result;
            const sequentialNumber = ('000' + this.ufr.requestNumber).slice(-3);
            this.requestNumber = (this.pom.fy - 2000)+ sequentialNumber;
          });
        });
      });
  }

  async initShorty() {
    if( this.ufr.shortyType == ShortyType.MRDB_PROGRAM ||
      this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM ||
      this.ufr.shortyType == ShortyType.NEW_FOS_FOR_MRDB_PROGRAM ) {
      this.shorty = await this.withFullNameService.program(this.ufr.shortyId);
    } else if( this.ufr.shortyType == ShortyType.PR ||
      this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_PR ||
      this.ufr.shortyType == ShortyType.NEW_FOS_FOR_PR ) {
      this.shorty = await this.withFullNameService.programRequest(this.pom.id, this.ufr.shortyId);
    } else { // this.ufr.shortyType == ShortyType.NEW_PROGRAM
      // leave this.shorty null
    }
  }
}
