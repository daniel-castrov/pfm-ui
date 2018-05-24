import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fy'
})
export class FyPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return 'FY'+(value-2000);
  }

}
