import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import {Notify} from "../../utils/Notify";


@Injectable()
export class ErrorHandlingInterceptor implements HttpInterceptor {

  constructor(private router: Router){};

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).do(event => {}, err => {
      
      if (err instanceof HttpErrorResponse ) {
        if ( err.status == 403) {
          this.router.navigate(['/no-access']);
        }
        if ( err.status == 404) {
          this.router.navigate(['/not-found']);
        }
        if ( err.status == 500) {
          this.router.navigate(['/server-error']);
        }
        if ( err.status == 409) {
          Notify.error(err.error.error);
        }
      }
      // If you do nothing then this interceptor just passes the requests and reponses through
  });
  }
}
