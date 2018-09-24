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

/**
 * Permanently caches return value of the function decorated. Permanently means the cache does expire and is available for reuse
 * until the user reloads the app with F5 or by typing a URL.
 * @param key the caller must provide a key uniquely identifying the cached value. The burden of uniqueness is on the caller. I know,
 * ideally we wouldn't be burdening the caller with this. May be in the future someone will figure out a way to avoid it.
 */
export function Caching(key: string ) : MethodDecorator {
  return function (target: Function, methodName: string, descriptor: any) {

    const originalMethod: () => Observable<any> = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return CacheService.caching(key, () => originalMethod.apply(this, args));
    }

    return descriptor;
  }
}

/**
 * Temporarily caches return value of the function decorated. Temporary means for 10 seconds and is intended to be enough
 * to reuse cached values during a single page load but not to reuse between page loads.
 * @param key the caller must provide a key uniquely identifying the cached value. The burden of uniqueness is on the caller. I know,
 * ideally we wouldn't be burdening the caller with this. May be in the future someone will figure out a way to avoid it.
 */
export function TemporaryCaching(key: string ) : MethodDecorator {
  return function (target: Function, methodName: string, descriptor: any) {

    const originalMethod: () => Observable<any> = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return CacheService.temporaryCaching(key, () => originalMethod.apply(this, args));
    }

    return descriptor;
  }
}
