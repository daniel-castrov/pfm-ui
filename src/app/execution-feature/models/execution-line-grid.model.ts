import { Event } from '../../pfm-coreui/models/event.model';
import { ExecutionEventData } from './execution-event-data.model';

export interface IExecutionLineGrid {
  id?: string;
  phaseId: string;
  appropriation: string;
  baOrBlin: string;
  sag: string;
  wucd: string;
  expenditureType: string;
  opAgency: string;
  programElement: string;
  programName: string;
  pb: number;
  toa: number;
  released?: number;
  withhold?: number;
  action: any;
  isDisabled?: boolean;
  events?: Event<ExecutionEventData>[];
}

export class ExecutionLineGrid implements IExecutionLineGrid {
  constructor(
    public phaseId: string,
    public appropriation: string,
    public baOrBlin: string,
    public sag: string,
    public wucd: string,
    public expenditureType: string,
    public opAgency: string,
    public programElement: string,
    public programName: string,
    public pb: number,
    public toa: number,
    public released: number,
    public withhold: number,
    public action: any,
    public id?: string,
    public isDisabled?: boolean,
    public events?: Event<ExecutionEventData>[]
  ) {}
}
