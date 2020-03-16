import { Inject, Injectable } from '@angular/core';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export abstract class EvaluationMeasureService extends BaseRestService {

  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  abstract getByProgram(programId: string): Observable<object>;
  abstract createEvaluationMeasure(data: any): Observable<object>;
  abstract updateEvaluationMeasure(data: any): Observable<object>;
  abstract deleteEvaluationMeasure(id: any): Observable<object>;

}
