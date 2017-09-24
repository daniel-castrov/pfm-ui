import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class DataService {

  constructor(public http:Http){

  }

  getProgram(){
    return this.http.get('http://ec2-34-231-125-182.compute-1.amazonaws.com:8080/jscbis/program/all')
      .map(res => res.json());
  }
}
