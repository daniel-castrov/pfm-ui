import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { RequestLink } from './requestLink';

@Injectable()
export class RequestLinkService {
    public requestLinks: Subject<RequestLink[]> = new Subject<RequestLink[]>();
}