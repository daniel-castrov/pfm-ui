import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable }                                        from 'rxjs/Observable';
import 'rxjs/add/operator/do';


@Injectable()
export class NoAccessInterceptor implements HttpInterceptor {


  constructor(private router: Router){};

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //alert("HA");
    return next.handle(req).do(event => {}, err => {
      if (err instanceof HttpErrorResponse && err.status == 403) {
          // handle 403 errors
          this.router.navigate(['/no-access']);
      }
  });
  }
}