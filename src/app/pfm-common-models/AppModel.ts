import { Injectable } from '@angular/core';
import { UserDetailsModel } from './UserDetailsModel';
import { PlanningPhase } from '../planning-feature/models/PlanningPhase';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root'
})
export class AppModel {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }

  // purpose of this model is to be able to easily share common information across all components in the application
  isUserSignedIn: boolean;
  userDetails: UserDetailsModel;
  visibilityDef: {};

  planningData: PlanningPhase[];
  selectedYear: string;
}
