import {Observable} from 'rxjs';
import {BaseRestService} from '../../services/base-rest.service';
import {HttpClient} from '@angular/common/http';


export abstract class PomService extends BaseRestService {

    constructor(protected httpClient: HttpClient) {
        super(httpClient);
    }

    abstract pBYearExists(year: string): Observable<Object>;

    abstract getPomFromPb(): Observable<Object>;

    abstract getPomFromFile(fileId: string): Observable<Object>;

    abstract getLatestPom(): Observable<object>;
}
