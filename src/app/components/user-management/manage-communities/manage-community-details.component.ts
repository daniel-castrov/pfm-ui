import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { AbstractControl, ValidationErrors, FormControl, Validators } from '@angular/forms';

// Other Components
import { HeaderComponent } from '../../header/header.component';

// Generated
import { User } from '../../../generated/model/user';
import { RestResult } from '../../../generated/model/restResult';
import { CommunityService } from '../../../generated/api/community.service';
import { Community } from '../../../generated/model/community';
import { Organization } from '../../../generated/model/organization';
import { UserService } from '../../../generated/api/user.service';
import { Role } from '../../../generated/model/role'
import { RoleService } from '../../../generated/api/role.service';
import { UserRoleResource } from '../../../generated/model/userRoleResource'
import { UserRoleResourceService } from '../../../generated/api/userRoleResource.service';
import { OrganizationService } from '../../../generated/api/organization.service';

@Component({
  selector: 'app-manage-community-details',
  templateUrl: './manage-community-details.component.html',
  styleUrls: ['./manage-community-details.component.scss']
})
export class MamageCommunityDetailsComponent {

  @ViewChild(HeaderComponent) header;

  // This is the id of the community we are interested in 
  private communityid: string;

  private approvers: User[]=[];
  private addedapprover:string;
  private resultError:string[]=[];
  private community: Community;
  private users:User[]=[];
  private organizations:Organization[]=[];
  private newOrg:Organization = new Object();

  private orgname = new FormControl('', [Validators.required, this.validName.bind(this)]);
  private orgidentifier  = new FormControl('', [Validators.required, this.validIdentifier .bind(this)]);

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private communityService: CommunityService,
    private roleService:RoleService,
    private userRoleResourceService:UserRoleResourceService,
    private organizationService:OrganizationService

  ) {
    this.route.params.subscribe((params: Params) => {
      this.communityid = params.id;
    });

  }

  private ngOnInit() {
    this.resultError;
    this.getCommunity();
    this.getUsers();
  }

  private getCommunity(): void {
    this.approvers=[];

    let result: RestResult;

    Observable.forkJoin([
      this.communityService.getById(this.communityid),
      this.userService.getByCommunityIdAndRoleName(this.communityid,"User_Approver"),
      this.organizationService.getByCommunityId(this.communityid)
    ]).subscribe(data => {

      this.resultError.push(data[0].error);
      this.resultError.push(data[1].error);
      this.resultError.push(data[2].error);

      this.community = data[0].result;
      if ( null==this.community ){
        this.resultError.push("The requested Community does not exist");
        return;
      }
      this.approvers = data[1].result;
      this.organizations = data[2].result;

    });
  }

  private getUsers(): void{
    let result:RestResult;
    this.userService.getByCommId(this.communityid)
    .subscribe(c => {
      result = c;
      this.resultError.push(result.error);
      this.users=result.result;
    });
  }

  private addApprover():void {

    let approverRole:Role;
    let resultRole: RestResult;
    this.roleService.getByNameAndCommunityId(this.communityid,"User_Approver")
    .subscribe(r => {
      resultRole = r;
      this.resultError.push(resultRole.error);
      approverRole = resultRole.result;
      let userRoleResource:UserRoleResource=new Object();
      userRoleResource.roleId=approverRole.id;
      userRoleResource.userId=this.addedapprover;

      let resultUserRole: RestResult;
      this.userRoleResourceService.create(userRoleResource)
      .subscribe(r => {
        resultRole = r;
        this.getCommunity();
      });
    });
  }

  private addOrganization():void {
    if ( this.newOrg.name &&  this.newOrg.abbreviation  ) {
      this.newOrg.communityId = this.communityid;
      this.organizationService.create(this.newOrg)
      .subscribe(data => {    
          this.resultError.push(data.error);
          this.newOrg = data.result;
          this.organizations.push(this.newOrg);
          this.resetFormControlValidation( this.orgname );
          this.resetFormControlValidation( this.orgidentifier );
          this.newOrg = new Object();
        });
    } 
  }

  private validName(control: AbstractControl): ValidationErrors | null {
    if(!this.organizations) return null;
    if( this.organizations.find( com =>  com.name == this.newOrg.name   ) ){
      return {alreadyExists:true};
    } 
    return null;
  }

  private validIdentifier(control: AbstractControl): ValidationErrors | null {
    if(!this.organizations) return null;
    if( this.organizations.find( com =>  com.abbreviation == this.newOrg.abbreviation   ) ) return {alreadyExists:true};
    return null;
  }

  private resetFormControlValidation(control: AbstractControl) {
    control.markAsPristine();
    control.markAsUntouched();
    control.updateValueAndValidity();
  }
}
