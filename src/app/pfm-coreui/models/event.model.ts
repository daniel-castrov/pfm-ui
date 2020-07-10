import { Moment } from 'moment';
import { EventType } from './event-type.model';

export class Event<T> {
  id: number;
  eventType: EventType;
  previousValue: T;
  value: T;
  reason: string;
  usercn: string;
  phaseId: string;
  timeStamp?: Moment;
  sucess?: boolean;
  error?: string;
  errorcode?: string;
}
