import { Inject, Injectable, Optional, InjectionToken } from '@angular/core';
import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';
import { CustomHttpUrlEncodingCodec } from '../../util/custom-http-url-encoding-codec';
import { Observable } from 'rxjs';
import { Configuration } from '../configuration/configuration';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  protected basePath = 'https://localhost/api';
  defaultHeaders = new HttpHeaders();
  configuration = new Configuration();

  constructor(
    protected httpClient: HttpClient,
    @Optional() @Inject(BASE_PATH) basePath: string,
    @Optional() configuration: Configuration
  ) {
    if (basePath) {
      this.basePath = basePath;
    }
    if (configuration) {
      this.configuration = configuration;
      this.basePath = basePath || configuration.basePath || this.basePath;
    }
  }

  /**
   * @param consumes string[] mime-types
   * @return true: consumes contains 'multipart/form-data', false: otherwise
   */
  private canConsumeForm(consumes: string[]): boolean {
    const form = 'multipart/form-data';
    for (const consume of consumes) {
      if (form === consume) {
        return true;
      }
    }
    return false;
  }

  /**
   *
   *
   * @param id the id of the file.
   * @param area the area where the file is located.
   * @param observe set whether or not to return the data Observable as the body, response or events.
   * defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  downloadFile(id: string, area: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
  downloadFile(id: string, area: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
  downloadFile(id: string, area: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
  downloadFile(id: string, area: string, observe: any = 'body', reportProgress: boolean = false): Observable<any> {
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling downloadFile.');
    }
    if (area === null || area === undefined) {
      throw new Error('Required parameter area was null or undefined when calling downloadFile.');
    }

    let queryParameters = new HttpParams({ encoder: new CustomHttpUrlEncodingCodec() });
    if (id !== undefined) {
      queryParameters = queryParameters.set('id', id as any);
    }
    if (area !== undefined) {
      queryParameters = queryParameters.set('area', area as any);
    }

    let headers = this.defaultHeaders;

    // to determine the Accept header
    const httpHeaderAccepts: string[] = [
      'application/json'
    ];
    const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
    if (httpHeaderAcceptSelected !== undefined) {
      headers = headers.set('Accept', httpHeaderAcceptSelected);
    }

    // to determine the Content-Type header
    const consumes: string[] = [
    ];

    return this.httpClient.get<any>(`${this.basePath}/library/downloadFile`,
      {
        params: queryParameters,
        withCredentials: this.configuration.withCredentials,
        headers,
        observe,
        reportProgress
      }
    );
  }

  /**
   * Get all
   * Get all the documents in the library
   * @param observe set whether or not to return the data Observable as the body, response or events.
   * defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  getAll(observe?: 'body', reportProgress?: boolean): Observable<any>;
  getAll(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
  getAll(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
  getAll(observe: any = 'body', reportProgress: boolean = false): Observable<any> {

    let headers = this.defaultHeaders;

    // to determine the Accept header
    const httpHeaderAccepts: string[] = [
      'application/json'
    ];
    const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
    if (httpHeaderAcceptSelected !== undefined) {
      headers = headers.set('Accept', httpHeaderAcceptSelected);
    }

    // to determine the Content-Type header
    const consumes: string[] = [
    ];

    return this.httpClient.get<any>(`${this.basePath}/library`,
      {
        withCredentials: this.configuration.withCredentials,
        headers,
        observe,
        reportProgress
      }
    );
  }

  /**
   * Get all from a particular file area
   * Get all the documents in the library that contain a certain key/value
   * @param key the key
   * @param value the value
   * @param observe set whether or not to return the data Observable as the body, response or events.
   * defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  getByKeyAndValue(key: string, value: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
  getByKeyAndValue(
    key: string, value: string, observe?: 'response', reportProgress?: boolean
  ): Observable<HttpResponse<any>>;
  getByKeyAndValue(
    key: string, value: string, observe?: 'events', reportProgress?: boolean
  ): Observable<HttpEvent<any>>;
  getByKeyAndValue(
    key: string, value: string, observe: any = 'body', reportProgress: boolean = false
  ): Observable<any> {
    if (key === null || key === undefined) {
      throw new Error('Required parameter key was null or undefined when calling getByKeyAndValue.');
    }
    if (value === null || value === undefined) {
      throw new Error('Required parameter value was null or undefined when calling getByKeyAndValue.');
    }

    let headers = this.defaultHeaders;

    // to determine the Accept header
    const httpHeaderAccepts: string[] = [
      'application/json'
    ];
    const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
    if (httpHeaderAcceptSelected !== undefined) {
      headers = headers.set('Accept', httpHeaderAcceptSelected);
    }

    // to determine the Content-Type header
    const consumes: string[] = [
    ];

    return this.httpClient.get<any>(
      `${this.basePath}/library/filemetadata/
      key/${encodeURIComponent(String(key))}/value/${encodeURIComponent(String(value))}`,
      {
        withCredentials: this.configuration.withCredentials,
        headers,
        observe,
        reportProgress
      }
    );
  }

  /**
   *
   *
   * @param file upload a document to the server
   * @param area the area where the file is going to be stored
   * @param observe set whether or not to return the data Observable as the body, response or events.
   * defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  uploadFile(file: Blob, area: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
  uploadFile(file: Blob, area: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
  uploadFile(file: Blob, area: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
  uploadFile(file: Blob, area: string, observe: any = 'body', reportProgress: boolean = false): Observable<any> {
    if (file === null || file === undefined) {
      throw new Error('Required parameter file was null or undefined when calling uploadFile.');
    }
    if (area === null || area === undefined) {
      throw new Error('Required parameter area was null or undefined when calling uploadFile.');
    }

    let queryParameters = new HttpParams({ encoder: new CustomHttpUrlEncodingCodec() });
    if (area !== undefined) {
      queryParameters = queryParameters.set('area', area as any);
    }

    let headers = this.defaultHeaders;

    // to determine the Accept header
    const httpHeaderAccepts: string[] = [
      'application/json'
    ];
    const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
    if (httpHeaderAcceptSelected !== undefined) {
      headers = headers.set('Accept', httpHeaderAcceptSelected);
    }

    // to determine the Content-Type header
    const consumes: string[] = [
      'multipart/form-data'
    ];

    const canConsumeForm = this.canConsumeForm(consumes);

    let formParams: { append(param: string, value: any); };
    let useForm = false;
    const convertFormParamsToString = false;
    // use FormData to transmit files using content-type 'multipart/form-data'
    // see https://stackoverflow.com/questions/4007969/application-x-www-form-urlencoded-or-multipart-form-data
    useForm = canConsumeForm;
    if (useForm) {
      formParams = new FormData();
    } else {
      formParams = new HttpParams({ encoder: new CustomHttpUrlEncodingCodec() });
    }

    if (file !== undefined) {
      formParams = formParams.append('file', file as any) || formParams;
    }

    return this.httpClient.post<any>(`${this.basePath}/library/uploadFile`,
      convertFormParamsToString ? formParams.toString() : formParams,
      {
        params: queryParameters,
        withCredentials: this.configuration.withCredentials,
        headers,
        observe,
        reportProgress
      }
    );
  }

}

export const BASE_PATH = new InjectionToken<string>('basePath');
export const COLLECTION_FORMATS = {
  csv: ',',
  tsv: '   ',
  ssv: ' ',
  pipes: '|'
};
