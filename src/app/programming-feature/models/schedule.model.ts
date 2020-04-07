import { Moment } from 'moment';

export class Schedule {
  id: string;
  programId?: string;
  order: number;
  taskDescription: string;
  fundingLineId: string;
  startDate?: Moment;
  endDate?: Moment;
}
