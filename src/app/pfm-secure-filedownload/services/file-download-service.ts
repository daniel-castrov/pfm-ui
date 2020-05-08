import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {
  protected baseURL: string;
  protected headers: HttpHeaders;

  constructor(protected httpClient: HttpClient) {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    this.headers = headers;
    this.baseURL = environment.apiUrl + '/library/downloadFile/id/';
  }

  async downloadSecureResource(id: string): Promise<Blob> {
    const file = await this.httpClient
      .get<Blob>(this.baseURL + id, { responseType: 'blob' as 'json' })
      .toPromise();
    return file;
  }

  protected getFullResponse(resource: string): Observable<object> {
    return this.httpClient.get(this.baseURL + '/' + resource, {
      observe: 'response',
      headers: this.headers.set('Authorization', 'Bearer ' + sessionStorage.getItem('auth_token'))
    });
  }
}
