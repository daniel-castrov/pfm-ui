import {CycleUtils} from './../../../services/cycle.utils';
import {Component, OnInit, ViewChild} from '@angular/core';
import {POMService, ProgramsService, PRService, ShortyType, UFR, UFRsService, UfrStatus} from '../../../generated';
import {HeaderComponent} from '../../header/header.component';
import {ActivatedRoute, UrlSegment} from '@angular/router';
import {WithFullName} from "../../../services/with-full-name.service";
import {UfrUfrTabComponent} from "./ufr-ufr-tab/ufr-ufr-tab.component";
import {UfrProgramComponent} from "./ufr-program-tab/ufr-program-tab.component";
import {UfrFundsComponent} from "./ufr-funds-tab/ufr-funds-tab.component";

@Component({
  selector: 'app-ufr-view',
  templateUrl: './ufr-view.component.html',
  styleUrls: ['./ufr-view.component.scss']
})
export class UfrViewComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @ViewChild(UfrUfrTabComponent) ufrUfrTabComponent: UfrUfrTabComponent;
  @ViewChild(UfrProgramComponent) ufrProgramComponent: UfrProgramComponent;
  @ViewChild(UfrFundsComponent) ufrFundsComponent: UfrFundsComponent;
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
      if(urlSegments[urlSegments.length - 2].path == 'create') {
        const serializedUfr = urlSegments[urlSegments.length - 1].path;
        this.ufr = JSON.parse(serializedUfr);
      } else {
        const ufrId = urlSegments[urlSegments.length - 1].path;
        this.ufr = (await this.ufrService.getUfrById(ufrId).toPromise()).result;
      }
      this.init();
      this.canedit = !!await this.cycleUtils.currentPom().toPromise();
    });
  }

  private async init() {
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

  async save() {
    if(this.ufr.id) {
      this.ufrService.update(this.ufr).subscribe();
    } else {
      this.ufr = (await this.ufrService.create(this.ufr).toPromise()).result;
    }
  }

  submit() {
    this.ufr.status = 'SUBMITTED';
    this.save();
  }

  get ufrNumber(): string {
    if(this.ufr.requestNumber) {
      const sequentialNumber = ('000' + this.ufr.requestNumber).slice(-3);
      return 'number ' + this.pomFy + sequentialNumber;
    } else {
      return '';
    }
  }

  private isNotSavable(): boolean {
    if(this.ufrUfrTabComponent && this.ufrUfrTabComponent.invalid()) return true;
    if(this.ufrProgramComponent && this.ufrProgramComponent.invalid()) return true;
    return this.ufr.status == UfrStatus.SUBMITTED;
  }

  private isNotSubmittable(): boolean {
    if(this.ufrUfrTabComponent && this.ufrUfrTabComponent.invalid()) return true;
    if(this.ufrProgramComponent && this.ufrProgramComponent.invalid()) return true;
    if(this.ufrFundsComponent && this.ufrFundsComponent.invalid()) return true;
    return this.ufr.status == UfrStatus.SUBMITTED;
  }
}

