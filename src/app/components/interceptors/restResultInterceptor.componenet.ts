import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { ErrorDataService } from '../error/errorData.service';

@Injectable()
export class RestResultInterceptor implements HttpInterceptor {

  constructor(private router: Router, private errorDataSvc:ErrorDataService){};

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).do(event => {
      if (event instanceof HttpResponse) {
        let error = event.body.error;
        if ( null == error || !error || error.lenth == 0 ){
          return event;
        } 
        else {
          console.log("Intercepted an error object in the server response:");
          console.log(error);
          this.errorDataSvc.errorData=error;
          this.router.navigate(['/restresult-error']);
        }
      }      
    });
  }
}