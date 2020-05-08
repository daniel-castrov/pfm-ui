import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DataGridMessage } from '../models/DataGridMessage';

@Injectable({
  providedIn: 'root'
})
export class DatagridMbService {
  protected messageBussSource = new Subject<DataGridMessage>();
  messageBus$: Observable<DataGridMessage> = this.messageBussSource.asObservable();

  sendMessage(message: DataGridMessage): void {
    this.messageBussSource.next(message);
  }
}
