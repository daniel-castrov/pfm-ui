import { Inject, Injectable } from '@angular/core';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export abstract class PfmHomeService extends BaseRestService {

  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  abstract getUserTasks(): Observable<Object>;

  abstract createNewsItem(data: any): Observable<Object>;
  abstract updateNewsItem(data: any): Observable<Object>;
  abstract deleteNewsItem(id: any): Observable<Object>;
  abstract getNewsItems(): Observable<Object>;

}
