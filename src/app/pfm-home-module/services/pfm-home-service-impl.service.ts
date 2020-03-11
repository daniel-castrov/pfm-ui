import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PfmHomeService } from './pfm-home-service';
import { NewsItem } from '../models/NewsItem';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PfmHomeServicesImpl extends PfmHomeService {

  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getUserTasks(): Observable<object> {
    throw new Error('Method not implemented.');
  }

  createNewsItem(data: any): Observable<object> {
    data = this.convertDateFromClient(data);
    return this.post('newsItem', data);
  }

  updateNewsItem(data: any): Observable<object> {
    return this.put('newsItem/newsItems', data);
  }

  deleteNewsItem(id: any): Observable<object> {
    return this.delete('newsItem/' + id);
  }

  getNewsItems(): Observable<object> {
    return this.get('newsItem')
      .pipe(map((res) => this.convertDateArrayFromServer(res)));
  }

  protected convertDateFromClient(newsItem: NewsItem): NewsItem {
    const copy: NewsItem = Object.assign({}, newsItem, {
      begin: newsItem.begin != null ? newsItem.begin.getTime() : null,
      end: newsItem.end != null ? newsItem.end.getTime() : null,
    });
    return copy;
  }

  protected convertDateArrayFromServer(res) {
    res.result.forEach((newsItem) => {

      newsItem.begin = newsItem.begin != null ?
        new Date(newsItem.begin * ((newsItem.begin % 1 !== 0 || `${newsItem.begin}`.length === 10) ? 1000 : 1)) : null;
      newsItem.end = newsItem.end != null ?
        new Date(newsItem.end * ((newsItem.end % 1 !== 0 || `${newsItem.end}`.length === 10) ? 1000 : 1)) : null;
    });

    return res;
  }
  protected convertDateFromServer(res) {
    if (res.result) {
      res.result.begin = res.body.begin != null ? new Date(res.result.begin) : null;
      res.result.end = res.body.end != null ? new Date(res.result.end) : null;
    }
    return res;
  }

}
