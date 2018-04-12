import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Request } from './request';

@Injectable()
export class RequestLinkService {
    public requestLinks: Subject<Request[]> = new Subject<Request[]>();
}