import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EvaluationMeasureService } from './evaluation-measure.service';
import { EvaluationMeasure } from '../models/evaluation-measure.model';
import { DATE_FORMAT } from '../../util/constants/input.constants';
import * as moment from 'moment';
import { RestResponse } from 'src/app/util/rest-response';

@Injectable({
  providedIn: 'root'
})
export class EvaluationMeasureServiceImpl extends EvaluationMeasureService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getByContainerId(containerId: string): Observable<object> {
    return this.get('evaluationMeasure/container/' + containerId).pipe(
      map((res: RestResponse<any>) => this.convertDateArrayFromServer(res))
    );
  }

  createEvaluationMeasure(data: any): Observable<object> {
    const copy = this.convertDateFromClient(data);
    return this.post('evaluationMeasure', copy).pipe(map((res: RestResponse<any>) => this.convertDateFromServer(res)));
  }

  updateEvaluationMeasure(data: any): Observable<object> {
    const copy = this.convertDateFromClient(data);
    return this.put('evaluationMeasure', copy);
  }

  deleteEvaluationMeasure(id: any): Observable<object> {
    return this.delete('evaluationMeasure/' + id);
  }

  protected convertDateFromClient(evaluationMeasure: EvaluationMeasure): EvaluationMeasure {
    const copy: EvaluationMeasure = Object.assign({}, evaluationMeasure, {
      currentPerformanceDate:
        evaluationMeasure.currentPerformanceDate != null && evaluationMeasure.currentPerformanceDate.isValid()
          ? evaluationMeasure.currentPerformanceDate.format(DATE_FORMAT)
          : null
    });
    return copy;
  }

  protected convertDateFromServer(res: RestResponse<any>): RestResponse<any> {
    if (res.result) {
      res.result.currentPerformanceDate =
        res.result.currentPerformanceDate != null ? moment(res.result.currentPerformanceDate) : null;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: RestResponse<any>): RestResponse<any> {
    if (res.result) {
      res.result.forEach((evaluationMeasure: EvaluationMeasure) => {
        evaluationMeasure.currentPerformanceDate =
          evaluationMeasure.currentPerformanceDate != null ? moment(evaluationMeasure.currentPerformanceDate) : null;
      });
    }
    return res;
  }
}
