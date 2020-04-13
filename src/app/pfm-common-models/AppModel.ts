import { Injectable } from '@angular/core';
import { UserDetailsModel } from './UserDetailsModel';
import { PlanningPhase } from '../planning-feature/models/PlanningPhase';

@Injectable({
  providedIn: 'root'
})
export class AppModel {
  // purpose of this model is to be able to easily share common information across all components in the application
  isUserSignedIn: boolean;
  userDetails: UserDetailsModel;
  visibilityDef: {};

  planningData: PlanningPhase[];
  selectedYear: string;
}
