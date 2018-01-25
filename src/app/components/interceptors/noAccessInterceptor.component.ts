import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';


@Injectable()
export class NoAccessInterceptor implements HttpInterceptor {


  constructor(private router: Router){};

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).do(event => {}, err => {
      
      if (err instanceof HttpErrorResponse ) {
        // handle 403 errors      
        if ( err.status == 403) {
          this.router.navigate(['/no-access']);
        }
        // handle 500 errors      
        if ( err.status == 500) {
          this.router.navigate(['/no-access']);
        }
        // Handle more errors
      }
      // If you do nothing then this interceptor just passes the requests and reponses through
  });
  }
}