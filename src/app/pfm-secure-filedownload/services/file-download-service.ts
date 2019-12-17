import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class FileDownloadService {
	protected baseURL:string;
	protected headers:HttpHeaders;

	constructor(protected httpClient:HttpClient) {

		let headers = new HttpHeaders();
		headers = headers.set('Content-Type', 'application/json; charset=utf-8');
		this.headers = headers;

		if (window.location.origin) {
			this.baseURL = window.location.origin + '/hutsandshackuploadservice/fileupload';
			if (window.location.port === '4200') {
				this.baseURL = "/hutsandshackuploadservice/fileupload";/*for local dev, use the proxyconfig.json to point /api to the correct destination without CORS issues*/
			}
		}
	}

	public async downloadSecureResource(id: string): Promise<Blob> {
		const file =  await this.httpClient.get<Blob>(this.baseURL +  id, {responseType: 'blob' as 'json'}).toPromise();
		return file;
	}

	protected getFullResponse(resource:string):Observable<Object>{
		return this.httpClient.get(this.baseURL + "/" + resource, {observe: "response", headers: this.headers.set('Authorization', "Bearer " + sessionStorage.getItem("auth_token"))});
	}
}