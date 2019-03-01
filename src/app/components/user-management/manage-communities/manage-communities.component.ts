import {Component} from '@angular/core';
import {AbstractControl, FormControl, ValidationErrors, Validators} from '@angular/forms';
import {Community, CommunityService, RestResult} from '../../../generated';

@Component({
  selector: 'app-manage-communities',
  templateUrl: './manage-communities.component.html',
  styleUrls: ['./manage-communities.component.scss']
})
export class ManageCommunitiesComponent {

  private commname = new FormControl('', [Validators.required, this.validName.bind(this)]);
  private commidentifier  = new FormControl('', [Validators.required, this.validIdentifier .bind(this)]);

  private communities: Community[] = [];
  private newCommunity: Community;
  private resultError: string[] = [];

  private createDisabled: boolean = true;

  constructor(
    public communityService: CommunityService,
  ) {
  }

  private ngOnInit() {
    this.getCommunities();
    this.newCommunity = new Object();
  }

  private getCommunities(): void {
    let result: RestResult;
    this.communityService.getAll()
      .subscribe(c => {
        result = c;
        this.resultError.push(result.error);
        this.communities = result.result;

        if (null == this.communities || this.communities.length == 0) {
          this.resultError.push("No Communities were found");
          return;
        }

      });
  }

  private addCommunity():void {

    if ( this.newCommunity.name &&  this.newCommunity.abbreviation  ) {
    this.communityService.create(this.newCommunity)
      .subscribe(data => {
        this.resultError.push(data.error);
        this.newCommunity = data.result;
        this.communities.push(this.newCommunity);
        this.resetFormControlValidation( this.commname );
        this.resetFormControlValidation( this.commidentifier );
        this.newCommunity = new Object();
      });
    } 
  }

  private validName(control: AbstractControl): ValidationErrors | null {
    if(!this.communities) return null;
    if( this.communities.find( com =>  com.name == this.newCommunity.name   ) ){
      return {alreadyExists:true};
    } 
    return null;
  }

  private validIdentifier(control: AbstractControl): ValidationErrors | null {
    if(!this.communities) return null;
    if( this.communities.find( com =>  com.abbreviation == this.newCommunity.abbreviation   ) ) return {alreadyExists:true};
    return null;
  }

  private resetFormControlValidation(control: AbstractControl) {
    control.markAsPristine();
    control.markAsUntouched();
    control.updateValueAndValidity();
  }


}
