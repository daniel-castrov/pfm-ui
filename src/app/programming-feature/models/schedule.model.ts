import { Moment } from 'moment';
import { Action } from 'src/app/pfm-common-models/Action';

export class Schedule {
  id: string;
  containerId?: string;
  order: number;
  taskDescription: string;
  fundingLineId: string;
  startDate?: Moment;
  endDate?: Moment;

  action?: Action;
  isDisabled?: boolean;
}
