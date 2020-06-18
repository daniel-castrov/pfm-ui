import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

/** single place for all services calls to funnel thru
 *   from here we can easily add in metrics/error-handling ect..without using interceptors.
 */
@Injectable({
  providedIn: 'root'
})
export class BaseRestService {
  protected baseURL: string;
  protected headers: HttpHeaders;

  constructor(protected httpClient: HttpClient) {
    this.baseURL = environment.apiUrl;
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    this.headers = headers;
  }

  protected get(resource: string, params?: HttpParams): Observable<object> {
    return this.httpClient.get(this.baseURL + '/' + resource, { headers: this.headers, params });
  }

  protected post(resource: string, data?: any): Observable<object> {
    return this.httpClient.post(this.baseURL + '/' + resource, data, { headers: this.headers });
  }

  protected put(resource: string, data?: any, params?: HttpParams): Observable<object> {
    return this.httpClient.put(this.baseURL + '/' + resource, data, { headers: this.headers, params });
  }

  protected delete(resource: string): Observable<object> {
    return this.httpClient.delete(this.baseURL + '/' + resource, { headers: this.headers });
  }

  // majority of callers will only want the response content - but some may need access to response-headers, ect...
  protected getFullResponse(resource: string): Observable<object> {
    return this.httpClient.get(this.baseURL + '/' + resource, { observe: 'response', headers: this.headers });
  }
}
