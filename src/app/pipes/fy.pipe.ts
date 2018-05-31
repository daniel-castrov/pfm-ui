import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'FY'
})
export class FyPipe implements PipeTransform {

  transform(value: number, args?: string): any {
    if (args) {
      return args + (value - 2000);
    }

    return 'FY' + (value - 2000);
  }

}
