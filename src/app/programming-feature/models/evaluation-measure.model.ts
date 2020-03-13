
export class EvaluationMeasure {
  id: string;
  programId: string;
  description: string;
  dataSource: string;
  targetPerformance: string;
  currentPerformance: string;
  currentPerformanceDate: Date;

  // Client side only
  action: any;
}
