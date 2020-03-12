import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  protected baseURL: string;
  protected headers: HttpHeaders;

  constructor(protected httpClient: HttpClient) {

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    this.headers = headers;
    this.baseURL = environment.apiUrl + '/library/uploadFile';

  }

  async uploadSecureResource(file: File) {
    const data: FormData = new FormData();
    data.append('file', file);
    const ret = await this.httpClient.post<any>(this.baseURL, data).toPromise();
    return ret;
  }
}
