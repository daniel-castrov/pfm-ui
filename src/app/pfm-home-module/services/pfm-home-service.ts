import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export abstract class PfmHomeService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  abstract getUserTasks(): Observable<object>;

  abstract createNewsItem(data: any): Observable<object>;
  abstract updateNewsItem(data: any): Observable<object>;
  abstract deleteNewsItem(id: any): Observable<object>;
  abstract getNewsItems(): Observable<object>;
}
