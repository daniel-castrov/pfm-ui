// TODO change this file's name to auth.service.ts
import { Injectable } from '@angular/core';
import { UserDetailsModel } from './UserDetailsModel';
import { PlanningPhase } from '../planning-feature/models/PlanningPhase';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

/**
 * @deprecated use LocalVisibilityService instead
 */
@Injectable({
  providedIn: 'root'
})
// FIXME we should use the observer pattern for the data in this service
// Using RxJS to listen to changes in this service's data is a good way to make sure everyone has the latest changes
export class AppModel {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }

  // purpose of this model is to be able to easily share common information across all components in the application
  isUserSignedIn: boolean;
  userDetails: UserDetailsModel;
  visibilityDef: {};

  planningData: PlanningPhase[];
  // FIXME shouldn't this be a number??
  selectedYear: string;
}
