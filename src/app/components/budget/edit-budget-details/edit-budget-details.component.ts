import { Component, ViewChild, ChangeDetectorRef, AfterContentChecked } from '@angular/core';

import {HeaderComponent} from '../../../components/header/header.component';
import { BES, RdteData, RdteDataService } from '../../../generated';
import { Notify } from '../../../utils/Notify';

import { TitleTabComponent } from './title-tab/title-tab.component';
import { OverviewTabComponent } from './overview-tab/overview-tab.component';
import { R1TabComponent } from './r1-tab/r1-tab.component';
import { R2TabComponent } from './r2-tab/r2-tab.component';
import { R2aTabComponent } from './r2a-tab/r2a-tab.component';

@Component({
  selector: 'edit-budget-details',
  templateUrl: './edit-budget-details.component.html',
  styleUrls: ['./edit-budget-details.component.scss']
})
export class EditBudgetDetailsComponent implements AfterContentChecked {

  @ViewChild( HeaderComponent ) header;
  @ViewChild( TitleTabComponent ) titleTabComponent: TitleTabComponent;
  @ViewChild( OverviewTabComponent ) overviewTabComponent: OverviewTabComponent;
  @ViewChild( R1TabComponent) r1TabComponent: R1TabComponent;
  @ViewChild( R2TabComponent ) r2TabComponent: R2TabComponent;
  @ViewChild( R2aTabComponent ) r2aTabComponent: R2aTabComponent;

  selectedScenario:BES;
  rdteData:RdteData;
  cannotSubmit :boolean = true;

  private _invalidFields: string[];

  constructor(
    private cd: ChangeDetectorRef,
    private rdteDataService: RdteDataService) {}

  ngAfterContentChecked() {
    this.cd.detectChanges();
  }

  get invalidFields(){
    return this._invalidFields;
  }

  set invalidFields( f:string[] ){
    this._invalidFields = f;
  }

  async save(){
    this.rdteData.submitted=false;
    if ( this.rdteData.id ){
      this.rdteData = (await this.rdteDataService.update( this.rdteData ).toPromise()).result;
    } else {
      this.rdteData = (await this.rdteDataService.create( this.rdteData ).toPromise()).result;
    }
    this.cannotSubmit = false;
  }

  async submit(){
    this.validate();
    if ( this._invalidFields.length>10 ) {
      Notify.error( "There are " + this._invalidFields.length + " reqired fields that still need to be addressed." );
      this.cannotSubmit = true;
    }
    else if ( this._invalidFields.length>0 ){
      let message = "The following Fields are missing/empty but required:";
      message = message + "<br/>" + this._invalidFields.join("<br/>")
      Notify.error( message );
      this.cannotSubmit = true;
    } else {
      this.rdteData.submitted=true;
      this.rdteData = (await this.rdteDataService.update( this.rdteData ).toPromise()).result;
      this.cannotSubmit = true;
    }
  }

  

  validate(){

    this._invalidFields = [];
    // LOGO
    if ( !this.rdteData.logoId || this.rdteData.logoId.length<1 ) this._invalidFields.push( "Logo Image" );

    // OVERVIEW TOC
    if ( !this.rdteData.overviewName || this.rdteData.overviewName.length<1 ) this._invalidFields.push( "Overview File" );
    Object.keys( this.rdteData.toc ).forEach( key => { 
      if ( (!this.rdteData.toc[key] || this.rdteData.toc[key].length<1) && !this._invalidFields.includes("Overview TOC") ) this._invalidFields.push( "Overview TOC" );
     });

     // R-1
     if ( !this.rdteData.r1Name || this.rdteData.r1Name.length<1 ) this._invalidFields.push( "R-1 File" );

     // R-2
     this.rdteData.r2data.forEach( r2 => {
       if ( !r2.missionDescription || r2.missionDescription.length<1 ) this._invalidFields.push( "R-2 " + r2.programElement + " Mission Description" );
       if ( !r2.fundingChange || r2.fundingChange.length<1 ) this._invalidFields.push( "R-2 " + r2.programElement + " Funding Change" );
       if ( !r2.scheduleChange || r2.scheduleChange.length<1 ) this._invalidFields.push( "R-2 " + r2.programElement + " Schedule Change" );
       if ( !r2.techincalChange || r2.techincalChange.length<1 ) this._invalidFields.push( "R-2 " + r2.programElement + " Technical Change" );
     })

     //R-2A is not required 
  }

  setCannotSubmit(){
    if ( !this.rdteData ) this.cannotSubmit = true;
    else if ( !this.rdteData.id ) this.cannotSubmit = true;
    else if ( !this.rdteData.submitted ) this.cannotSubmit = false;
    else this.cannotSubmit = true;
  }

}
