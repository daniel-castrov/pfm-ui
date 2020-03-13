import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NewsItem } from '../../pfm-home-module/models/NewsItem';
import { EvaluationMeasureService } from './evaluation-measure.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluationMeasureServiceImpl extends EvaluationMeasureService {

  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getByProgram(programId: string): Observable<object> {
    return this.get('evaluationMeasure/programId/' + programId);
  }

  createEvaluationMeasure(data: any): Observable<object> {
    return this.post('evaluationMeasure', data);
  }

  updateEvaluationMeasure(data: any): Observable<object> {
    return this.put('evaluationMeasure', data);
  }

  deleteEvaluationMeasure(id: any): Observable<object> {
    return this.delete('evaluationMeasure/' + id);
  }

}
