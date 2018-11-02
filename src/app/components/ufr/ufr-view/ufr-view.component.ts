import {CycleUtils} from './../../../services/cycle.utils';
import {Component, OnInit, ViewChild} from '@angular/core';
import {Pom, POMService, ShortyType, UFR, UFRsService, UfrStatus, Organization, OrganizationService} from '../../../generated';
import {HeaderComponent} from '../../header/header.component';
import {ActivatedRoute, UrlSegment} from '@angular/router';
import {WithFullName, WithFullNameService} from "../../../services/with-full-name.service";
import {UfrUfrTabComponent} from "./ufr-ufr-tab/ufr-ufr-tab.component";
import {UfrProgramComponent} from "./ufr-program-tab/ufr-program-tab.component";
import {UfrFundsComponent} from "./ufr-funds-tab/ufr-funds-tab.component";
import {Notify} from "../../../utils/Notify";

@Component({
  selector: 'app-ufr-view',
  templateUrl: './ufr-view.component.html',
  styleUrls: ['./ufr-view.component.scss']
})
export class UfrViewComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @ViewChild(UfrUfrTabComponent) ufrUfrTabComponent: UfrUfrTabComponent;
  @ViewChild(UfrFundsComponent) ufrFundsComponent: UfrFundsComponent;
  @ViewChild(UfrProgramComponent) ufrProgramComponent: UfrProgramComponent;
  private ufr: UFR;
  private canedit: boolean = false;
  private pom: Pom;
  private pomFy: number;
  private shorty: WithFullName;

  constructor( private ufrService: UFRsService,
               private cycleUtils: CycleUtils,
               private route: ActivatedRoute,
               private pomService: POMService,
               private orgService: OrganizationService,
               private withFullNameService : WithFullNameService ) {}

  async ngOnInit() {
    this.route.url.subscribe(async(urlSegments: UrlSegment[]) => { // don't try to convert this one to Promise -- it doesn't work
      if(urlSegments[urlSegments.length - 1].path == 'create') {
        const serializedUfr = sessionStorage.getItem('ufr');
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
    this.pom = (await this.pomService.getById(this.ufr.phaseId).toPromise()).result;
    this.pomFy = this.pom.fy - 2000;
    this.initShorty();
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

  async save() {
    await this.setOrganizationFromLeadComponent();
    let fundsTabValidation = this.ufrFundsComponent.validate;
    if(!fundsTabValidation.isValid){
      Notify.error(fundsTabValidation.message);
    } else {
      if(this.ufr.id) {
        this.ufrService.update(this.ufr).subscribe(d => {
          if (d.error) {
            Notify.error(d.error); 
          }
          else {
            if (this.ufr.status === UfrStatus.SUBMITTED) {
              Notify.success('UFR submitted successfully');
            } else {
              Notify.success('UFR saved successfully');
            }
          }
        });
      } else {
        if (this.ufr.status === UfrStatus.SUBMITTED) {
          // going straight to SUBMIT without a SAVE first (so save first!)
          this.ufrService.create(this.ufr).subscribe(d => {
            if (d.error) {
              Notify.error(d.error);
            }
            else {
              this.ufr = d.result;
              this.ufr.status = UfrStatus.SUBMITTED;
              this.save();
            }
          });
        }
        else {
          this.ufr = (await this.ufrService.create(this.ufr).toPromise()).result;
          Notify.success('UFR created successfully')
        }
      }
    }
  }

  submit() {
    this.ufr.status = UfrStatus.SUBMITTED;
    this.save();
  }

  async setOrganizationFromLeadComponent(){

    let orgstring:string;
    if (this.ufr.leadComponent == "ECBC"){ 
      orgstring = "DUSA-TE";
    } else {
      orgstring = this.ufr.leadComponent;
    }
    let org:Organization = (await this.orgService.getByAbbreviation(orgstring).toPromise()).result;
    this.ufr.organizationId = org.id;
  }

  get ufrNumber(): string {
    if(this.ufr.requestNumber) {
      const sequentialNumber = ('000' + this.ufr.requestNumber).slice(-3);
      return 'number ' + this.pomFy + sequentialNumber;
    } else {
      return '';
    }
  }

  isNotSavable(): boolean {
    if(this.ufrUfrTabComponent && this.ufrUfrTabComponent.invalid()) return true;
    if(this.ufrProgramComponent && this.ufrProgramComponent.invalid()) return true;
    return this.ufr.status == UfrStatus.SUBMITTED;
  }

  isNotSubmittable(): boolean {
    if(this.ufrUfrTabComponent && this.ufrUfrTabComponent.invalid()) return true;
    if(this.ufrProgramComponent && this.ufrProgramComponent.invalid()) return true;
    if(this.ufrFundsComponent && this.ufrFundsComponent.invalid()) return true;
    return this.ufr.status == UfrStatus.SUBMITTED;
  }

  ufrType(): string {
    if(this.ufr.shortyType == ShortyType.MRDB_PROGRAM) return ` ${this.shorty ? this.shorty.fullname : ''} program`;
    if(this.ufr.shortyType == ShortyType.PR) return " a program request";
    if(this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM || this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_PR) return " a new increment";
    if(this.ufr.shortyType == ShortyType.NEW_FOS_FOR_MRDB_PROGRAM || this.ufr.shortyType == ShortyType.NEW_FOS_FOR_PR) return " a new FoS";
    if(this.ufr.shortyType == ShortyType.NEW_PROGRAM) return " a new program";
  }

}

