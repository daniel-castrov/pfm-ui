import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Notify} from '../../utils/Notify';
import {tap} from 'rxjs/operators';


@Injectable()
export class ErrorHandlingInterceptor implements HttpInterceptor {

  constructor(private router: Router){};

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(tap(event => {}, err => {
      
      if (err instanceof HttpErrorResponse ) {
        if ( err.status == 403) {
          this.router.navigate(['/no-access']);
        }
        if ( err.status == 500) {
          this.router.navigate(['/server-error']);
        }
        if ( err.status == 409) {
          Notify.error(err.error.error);
        }
      }
      // If you do nothing then this interceptor just passes the requests and reponses through
  }));
  }
}
