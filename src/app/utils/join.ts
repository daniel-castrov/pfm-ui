import {RestResult} from '../generated/model/restResult';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {SubscribableOrPromise} from 'rxjs/internal/types';
import {map} from 'rxjs/operators';

/**
 * returns an array of Promises of the sources with the member `result` removed
 * @param sources promises or observables containing the payload in a member `result` of the response.
 */
export const join = (...sources: SubscribableOrPromise<RestResult>[]): Promise<any> =>
  forkJoin(sources)
    .pipe(map( (restResult: RestResult[]) => restResult.map( (restResult: RestResult) => restResult.result )))
    .toPromise();
