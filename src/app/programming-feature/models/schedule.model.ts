import { Moment } from 'moment';

export class Schedule {
  id: string;
  taskDescription: string;
  fundingLineId: string;
  startDate?: Moment;
  endDate?: Moment;
}
