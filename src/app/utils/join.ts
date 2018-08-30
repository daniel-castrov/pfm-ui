import { RestResult } from '../generated/model/restResult';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Observable } from 'rxjs/Observable';


export const join = (...observables: Observable<RestResult>[]) => 
    forkJoin(observables)
    .map( (restResult: RestResult[]) => restResult.map( (restResult: RestResult) => restResult.result ))
    .toPromise()
