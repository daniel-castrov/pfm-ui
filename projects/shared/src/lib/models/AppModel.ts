import { Injectable } from '@angular/core';
import { UserDetailsModel } from './UserDetailsModel';

@Injectable({
  providedIn: 'root'
})
export class AppModel {
  //purpose of this model is to be able to easily share common information across all components in the application
  public isUserSignedIn:boolean;
  public elevated:boolean;
  public userDetails:UserDetailsModel;
}