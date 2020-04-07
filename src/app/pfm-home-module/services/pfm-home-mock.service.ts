import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserTask } from '../models/UserTask';
import { NewsItem } from '../models/NewsItem';

Injectable({
  providedIn: 'root'
});
@Injectable()
export class PfmHomeMockService {

  constructor() {
  }

  getUserTasks(): Observable<Object> {

    const t1: UserTask = new UserTask();
    t1.assignedDate = new Date();
    t1.dueDate = new Date();
    t1.description = 'test description from mock service';
    t1.id = '1';
    t1.name = 'test name from mock service';

    const t2: UserTask = new UserTask();
    t2.assignedDate = new Date();
    t2.dueDate = new Date();
    t2.description = 'test description from mock service';
    t2.id = '2';
    t2.name = 'test name from mock service';

    return of([t1, t2]);
  }

  getNewsItems(): Observable<Object> {// return a list of news items
    const n1: NewsItem = new NewsItem();
    n1.createDate = new Date();
    n1.text = 'details from mock service';
    n1.order = 1;

    return of([n1]);
  }
}
