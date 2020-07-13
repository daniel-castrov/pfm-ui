import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from '../util/constants/app.constants';
import { IBudget } from '../shared/models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private resourceUrl = `${SERVER_API_URL}/budget`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<HttpResponse<IBudget[]>> {
    return this.http.get<IBudget[]>(this.resourceUrl, { observe: 'response' });
  }

  findLatest(): Observable<HttpResponse<IBudget>> {
    return this.http.get<IBudget>(`${this.resourceUrl}/latest`, { observe: 'response' });
  }

  findAvailableYears(): Observable<HttpResponse<number[]>> {
    return this.http.get<number[]>(`${this.resourceUrl}/available-years`, { observe: 'response' });
  }

  findByFiscalYear(fy: number): Observable<HttpResponse<IBudget>> {
    return this.http.get<IBudget>(`${this.resourceUrl}/year/${fy}`, { observe: 'response' });
  }

  create(fy: number): Observable<HttpResponse<IBudget>> {
    return this.http.post<IBudget>(`${this.resourceUrl}/year/${fy}`, null, { observe: 'response' });
  }
}
