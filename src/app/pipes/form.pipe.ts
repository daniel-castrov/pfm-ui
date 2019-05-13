import { Pipe, PipeTransform } from '@angular/core';
import {DecimalPipe} from '@angular/common';

@Pipe({
  name: 'form'
})
export class FormPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!value) {
      return '-';
    }

    return new DecimalPipe('en-US').transform(value, '.3-3');
  }
}
