import { Moment } from 'moment';

export class Schedule {
  id: string;
  order: number;
  taskDescription: string;
  fundingLineId: string;
  startDate?: Moment;
  endDate?: Moment;
}
