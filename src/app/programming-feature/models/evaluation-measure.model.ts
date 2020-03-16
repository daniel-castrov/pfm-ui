import { Moment } from 'moment';

export class EvaluationMeasure {
  id: string;
  programId: string;
  measureId: string;
  description: string;
  dataSource: string;
  targetPerformance: string;
  currentPerformance: string;
  currentPerformanceDate: Moment;

  // Client side only
  action: any;
}
