import { Moment } from 'moment';

export class ProcessPrioritization {
  id: string;
  programId: string;
  potentialProcesses: string;
  priorityRanking: string;
  estimatedCompletionDate: Moment;
  notes: string;

  // Client side only
  action: any;
}
