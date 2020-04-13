export class PlanningPhase {
  created: Date;
  modified: Date;
  modifiedBy: string;
  createdBy: string;
  id: string;
  communityId: string;
  year: number;
  name: string;
  state: string; // CREATED, OPEN, LOCKED, CLOSED
}
