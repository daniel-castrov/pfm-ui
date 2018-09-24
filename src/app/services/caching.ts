import {Observable, ReplaySubject} from "rxjs";

export class CacheService {

  private static cache: { [key: string]: Observable<any> } = {};

  static caching<T>(key: string, observableGetter: () => Observable<T>): Observable<T> {
    if (this.cache[key]) {
      return this.cache[key] as Observable<T>;
    }

    const replay = new ReplaySubject<T>(1);
    observableGetter().subscribe(
      x => replay.next(x),
      x => replay.error(x),
      () => replay.complete()
    );
    const result = replay.asObservable();

    this.cache[key] = result;
    return result;
  }

  static temporaryCaching<T>(key: string, observableGetter: () => Observable<T>): Observable<T> {
    setTimeout(()=> {
      delete this.cache[key];
    }, 10000); // delete the cache entry in 10 seconds
    return this.caching(key, observableGetter);
  }
}

export function Caching(key: string ) : MethodDecorator {
  return function (target: Function, methodName: string, descriptor: any) {

    const originalMethod: () => Observable<any> = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return CacheService.caching(key, () => originalMethod.apply(this, args));
    }

    return descriptor;
  }
}

export function TemporaryCaching(key: string ) : MethodDecorator {
  return function (target: Function, methodName: string, descriptor: any) {

    const originalMethod: () => Observable<any> = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return CacheService.temporaryCaching(key, () => originalMethod.apply(this, args));
    }

    return descriptor;
  }
}
