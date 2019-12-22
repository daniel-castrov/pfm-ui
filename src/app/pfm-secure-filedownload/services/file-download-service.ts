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
    this.baseURL = "https://pfmdev1.pxalphaproject.com/pfm-server/library/downloadFile/id/";

	}

	public async downloadSecureResource(id: string): Promise<Blob> {
		const file =  await this.httpClient.get<Blob>(this.baseURL +  id, {responseType: 'blob' as 'json'}).toPromise();
		return file;
	}

	protected getFullResponse(resource:string):Observable<Object>{
		return this.httpClient.get(this.baseURL + "/" + resource, {observe: "response", headers: this.headers.set('Authorization', "Bearer " + sessionStorage.getItem("auth_token"))});
	}
}