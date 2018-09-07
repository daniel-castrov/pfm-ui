import {CycleUtils} from './../../../services/cycle.utils';
import {Component, OnInit, ViewChild} from '@angular/core';
import {POMService, ProgramsService, PRService, ShortyType, UFR, UFRsService} from '../../../generated';
import {HeaderComponent} from '../../header/header.component';
import {ActivatedRoute, UrlSegment} from '@angular/router';
import {WithFullName} from "../../../services/with-full-name.service";

@Component({
  selector: 'app-ufr-view',
  templateUrl: './ufr-view.component.html',
  styleUrls: ['./ufr-view.component.scss']
})
export class UfrViewComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private ufr: UFR;
  private canedit: boolean = false;
  private pomFy: number;
  private shorty: WithFullName;

  constructor( private ufrService: UFRsService,
               private cycleUtils: CycleUtils,
               private route: ActivatedRoute,
               private pomService: POMService,
               private programsService: ProgramsService,
               private prService: PRService ) {}

  async ngOnInit() {
    this.route.url.subscribe(async(urlSegments: UrlSegment[]) => { // don't try to convert this one to Promise -- it doesn't work
      const ufrId = urlSegments[urlSegments.length - 1].path;
      this.init(ufrId);
      this.canedit = !!await this.cycleUtils.currentPom().toPromise();
    });
  }

  private async init(ufrId: string) {
    this.ufr = (await this.ufrService.getUfrById(ufrId).toPromise()).result;
    this.pomFy = (await this.pomService.getById(this.ufr.phaseId).toPromise()).result.fy  - 2000;
    this.initShorty();
  }

  async initShorty() {
    if( this.ufr.shortyType == ShortyType.MRDB_PROGRAM ||
        this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM ||
        this.ufr.shortyType == ShortyType.NEW_FOS_FOR_MRDB_PROGRAM ) {
      this.shorty = (await this.programsService.getProgramById(this.ufr.shortyId).toPromise()).result;
    } else if( this.ufr.shortyType == ShortyType.PR ||
               this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_PR ||
               this.ufr.shortyType == ShortyType.NEW_FOS_FOR_PR ) {
      this.shorty = (await this.prService.getById(this.ufr.shortyId).toPromise()).result;
    } else { // this.ufr.shortyType == ShortyType.NEW_PROGRAM
      // leave this.shorty null
    }
  }

  save() {
    this.ufrService.update(this.ufr).subscribe();
  }

  submit() {
    this.ufr.status = 'SUBMITTED';
    this.save();
  }

  get ufrNumber(): string {
    const sequentialNumber = ('000' + this.ufr.requestNumber).slice(-3);
    return this.pomFy + sequentialNumber;
  }
}
