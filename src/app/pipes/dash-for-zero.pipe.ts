import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dashForZero'
})
export class DashForZeroPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (null == value || '0' == value) {
      return '-';
    }

    return value;
  }
}
